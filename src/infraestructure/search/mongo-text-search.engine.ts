import { ISearchDocument } from '../../domain/search/entity/interfaces/search-document.interface';
import {
  ISearchEngine,
  ISearchEngineQuery,
} from '../../domain/search/engine/search-engine.interface';
import { ISearchDocumentRepositoryRead } from '../../domain/search/repository/search-document.repository.read';

/**
 * Lexical search fallback for local/Jest: regex + facet filters via repository.
 */
export class MongoTextSearchEngine implements ISearchEngine {
  constructor(
    private readonly searchDocumentRepositoryRead: ISearchDocumentRepositoryRead,
  ) {}

  async search(query: ISearchEngineQuery): Promise<ISearchDocument[]> {
    return this.searchDocumentRepositoryRead.search({
      q: query.q,
      categoryId: query.categoryId,
      filters: query.filters,
      status: query.status,
      limit: query.limit,
    });
  }
}
