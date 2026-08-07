import { ICategoryRepositoryRead } from '../../catalog/repository/category.repository.read';
import { IServiceTaxonomyRepositoryRead } from '../../catalog/repository/service-taxonomy.repository.read';
import { IListingRepositoryRead } from '../../listings/repository/listing.repository.read';
import { ISearchDocumentService } from './search-document.service.interface';
import { ISynonymService } from './synonym.service.interface';

export interface ISearchReconcileResult {
  listingsReindexed: number;
  synonymsUpserted: number;
}

export interface IParamsSearchReconciliationService {
  listingRepositoryRead: IListingRepositoryRead;
  categoryRepositoryRead: ICategoryRepositoryRead;
  serviceTaxonomyRepositoryRead: IServiceTaxonomyRepositoryRead;
  searchDocumentService: ISearchDocumentService;
  synonymService: ISynonymService;
}

export interface ISearchReconciliationService {
  reconcile(): Promise<ISearchReconcileResult>;
}
