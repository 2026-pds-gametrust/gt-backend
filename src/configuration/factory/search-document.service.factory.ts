import { SearchDocumentService } from '../../domain/search/service/search-document.service';
import { ProductRepositoryRead } from '../../infraestructure/repository/catalog/product.repository.read';
import { ListingRepositoryRead } from '../../infraestructure/repository/listings/listing.repository.read';
import { SearchDocumentRepositoryRead } from '../../infraestructure/repository/search/search-document.repository.read';
import { SearchDocumentRepositoryWrite } from '../../infraestructure/repository/search/search-document.repository.write';
import { SellerLevelRepositoryRead } from '../../infraestructure/repository/trust/seller-level.repository.read';
import { TrustScoreRepositoryRead } from '../../infraestructure/repository/trust/trust-score.repository.read';
import { SealRepositoryRead } from '../../infraestructure/repository/verification/seal.repository.read';
import { EventPublisherFactory } from './messaging/event-publisher.factory';
import { QueryLogServiceFactory } from './query-log.service.factory';
import { SearchEngineFactory } from './search-engine.factory';
import { SynonymServiceFactory } from './synonym.service.factory';

export class SearchDocumentServiceFactory {
  static create() {
    return new SearchDocumentService({
      searchDocumentRepositoryRead: new SearchDocumentRepositoryRead(),
      searchDocumentRepositoryWrite: new SearchDocumentRepositoryWrite(),
      listingRepositoryRead: new ListingRepositoryRead(),
      productRepositoryRead: new ProductRepositoryRead(),
      trustScoreRepositoryRead: new TrustScoreRepositoryRead(),
      sellerLevelRepositoryRead: new SellerLevelRepositoryRead(),
      sealRepositoryRead: new SealRepositoryRead(),
      searchEngine: SearchEngineFactory.create(),
      synonymService: SynonymServiceFactory.create(),
      queryLogService: QueryLogServiceFactory.create(),
      eventPublisher: EventPublisherFactory.create(),
    });
  }
}
