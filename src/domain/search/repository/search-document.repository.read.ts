import { ISearchDocument } from '../entity/interfaces/search-document.interface';
import { TSearchFacetValue } from '../entity/interfaces/search-document.interface';

export interface ISearchQueryParams {
  q?: string;
  categoryId?: string;
  filters?: Record<string, TSearchFacetValue>;
  status?: string;
  limit?: number;
}

export interface ISearchDocumentRepositoryRead {
  findByListingId(listingId: string): Promise<ISearchDocument | null>;
  findById(id: string): Promise<ISearchDocument | null>;
  search(params: ISearchQueryParams): Promise<ISearchDocument[]>;
}
