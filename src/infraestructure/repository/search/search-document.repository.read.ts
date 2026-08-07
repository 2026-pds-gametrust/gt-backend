import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { FilterQuery } from 'mongoose';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { ISearchDocument } from '../../../domain/search/entity/interfaces/search-document.interface';
import {
  ISearchDocumentRepositoryRead,
  ISearchQueryParams,
} from '../../../domain/search/repository/search-document.repository.read';
import {
  IMSearchDocument,
  SearchDocumentModel,
} from '../../db/mongo/models/search-document.model';
import { dbToInternal } from './adapters/search-document.adapter';

export class SearchDocumentRepositoryRead
  implements ISearchDocumentRepositoryRead
{
  async findByListingId(listingId: string): Promise<ISearchDocument | null> {
    try {
      const doc = await SearchDocumentModel.findOne({ listingId });
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'SearchDocumentRepositoryRead.findByListingId',
        eventData: { listingId },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async findById(id: string): Promise<ISearchDocument | null> {
    try {
      const doc = await SearchDocumentModel.findOne({ id });
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'SearchDocumentRepositoryRead.findById',
        eventData: { id },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async search(params: ISearchQueryParams): Promise<ISearchDocument[]> {
    try {
      const query: FilterQuery<IMSearchDocument> = {
        status: params.status ?? 'PUBLISHED',
      };

      if (params.categoryId) {
        query.categoryId = params.categoryId;
      }

      if (params.q?.trim()) {
        const terms = [
          ...new Set(
            params.q
              .trim()
              .split(/\s+/)
              .map((term) => term.trim())
              .filter(Boolean),
          ),
        ];
        query.$or = terms.flatMap((term) => {
          const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          return [
            { searchText: { $regex: escaped, $options: 'i' } },
            { title: { $regex: escaped, $options: 'i' } },
            { brand: { $regex: escaped, $options: 'i' } },
            { model: { $regex: escaped, $options: 'i' } },
          ];
        });
      }

      if (params.filters) {
        for (const [key, value] of Object.entries(params.filters)) {
          query[`facets.${key}`] = value;
        }
      }

      const limit = params.limit && params.limit > 0 ? params.limit : 100;
      const docs = await SearchDocumentModel.find(query).limit(limit);
      return docs.map(dbToInternal);
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'SearchDocumentRepositoryRead.search',
        eventData: { params },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
