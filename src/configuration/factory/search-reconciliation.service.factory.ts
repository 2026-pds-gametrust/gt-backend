import { SearchReconciliationService } from '../../domain/search/service/search-reconciliation.service';
import { CategoryRepositoryRead } from '../../infraestructure/repository/catalog/category.repository.read';
import { ServiceTaxonomyRepositoryRead } from '../../infraestructure/repository/catalog/service-taxonomy.repository.read';
import { ListingRepositoryRead } from '../../infraestructure/repository/listings/listing.repository.read';
import { SearchDocumentServiceFactory } from './search-document.service.factory';
import { SynonymServiceFactory } from './synonym.service.factory';

export class SearchReconciliationServiceFactory {
  static create() {
    return new SearchReconciliationService({
      listingRepositoryRead: new ListingRepositoryRead(),
      categoryRepositoryRead: new CategoryRepositoryRead(),
      serviceTaxonomyRepositoryRead: new ServiceTaxonomyRepositoryRead(),
      searchDocumentService: SearchDocumentServiceFactory.create(),
      synonymService: SynonymServiceFactory.create(),
    });
  }
}
