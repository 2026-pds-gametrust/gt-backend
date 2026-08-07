import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../domain/common/errors/enums/EErrorCode';
import { ISearchDocument } from '../../domain/search/entity/interfaces/search-document.interface';
import {
  ISearchEngine,
  ISearchEngineQuery,
} from '../../domain/search/engine/search-engine.interface';
import {
  IMSearchDocument,
  SearchDocumentModel,
} from '../db/mongo/models/search-document.model';
import { dbToInternal } from '../repository/search/adapters/search-document.adapter';

export const ATLAS_LEXICAL_INDEX_NAME = 'search_documents_lexical';

/**
 * Lexical search via MongoDB Atlas Search ($search).
 * Requires SEARCH_ENGINE=atlas and index `search_documents_lexical`.
 */
export class AtlasSearchEngine implements ISearchEngine {
  async search(query: ISearchEngineQuery): Promise<ISearchDocument[]> {
    const limit = query.limit && query.limit > 0 ? query.limit : 100;
    const status = query.status ?? 'PUBLISHED';

    const must: Record<string, unknown>[] = [];
    if (query.q?.trim()) {
      must.push({
        text: {
          query: query.q.trim(),
          path: ['searchText', 'title', 'brand', 'model'],
        },
      });
    }

    const filter: Record<string, unknown>[] = [
      { equals: { path: 'status', value: status } },
    ];

    if (query.categoryId) {
      filter.push({
        equals: { path: 'categoryId', value: query.categoryId },
      });
    }

    if (query.filters) {
      for (const [key, value] of Object.entries(query.filters)) {
        filter.push({
          equals: { path: `facets.${key}`, value },
        });
      }
    }

    const compound: Record<string, unknown> = { filter };
    if (must.length > 0) {
      compound.must = must;
    }

    try {
      const docs = await SearchDocumentModel.aggregate<IMSearchDocument>([
        {
          $search: {
            index: ATLAS_LEXICAL_INDEX_NAME,
            compound,
          },
        },
        { $limit: limit },
      ]);
      return docs.map(dbToInternal);
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'AtlasSearchEngine.search',
        eventData: { query, index: ATLAS_LEXICAL_INDEX_NAME },
      });

      const message = String(error?.message ?? error);
      const atlasUnavailable =
        /\$search|index .* not found|Unrecognized pipeline stage|Atlas Search/i.test(
          message,
        );

      throw {
        status: atlasUnavailable ? 503 : 500,
        errorCode: EErrorCode.DATABASE_ERROR,
        message: atlasUnavailable
          ? `Atlas Search unavailable for index "${ATLAS_LEXICAL_INDEX_NAME}". Configure the index or set SEARCH_ENGINE=mongo. Cause: ${message}`
          : message,
      } as IThrowedError;
    }
  }
}
