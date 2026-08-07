import { ISearchDocument } from '../entity/interfaces/search-document.interface';

export interface ISearchEngineQuery {
  q?: string;
  categoryId?: string;
  filters?: Record<string, string | number | boolean>;
  status?: string;
  limit?: number;
}

export interface ISearchEngine {
  search(query: ISearchEngineQuery): Promise<ISearchDocument[]>;
}
