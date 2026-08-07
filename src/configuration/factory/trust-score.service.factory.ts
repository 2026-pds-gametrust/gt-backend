import { TrustScoreService } from '../../domain/trust/service/trust-score.service';
import { TrustEventRepositoryRead } from '../../infraestructure/repository/trust/trust-event.repository.read';
import { TrustScoreRepositoryRead } from '../../infraestructure/repository/trust/trust-score.repository.read';
import { TrustScoreRepositoryWrite } from '../../infraestructure/repository/trust/trust-score.repository.write';
import { EventPublisherFactory } from './messaging/event-publisher.factory';
import { SellerLevelServiceFactory } from './seller-level.service.factory';

export class TrustScoreServiceFactory {
  static create() {
    return new TrustScoreService({
      trustScoreRepositoryRead: new TrustScoreRepositoryRead(),
      trustScoreRepositoryWrite: new TrustScoreRepositoryWrite(),
      trustEventRepositoryRead: new TrustEventRepositoryRead(),
      sellerLevelService: SellerLevelServiceFactory.create(),
      eventPublisher: EventPublisherFactory.create(),
    });
  }
}
