import { SealService } from '../../domain/verification/service/seal.service';
import { SealRepositoryRead } from '../../infraestructure/repository/verification/seal.repository.read';
import { SealRepositoryWrite } from '../../infraestructure/repository/verification/seal.repository.write';
import { EventPublisherFactory } from './messaging/event-publisher.factory';
import { TrustEventServiceFactory } from './trust-event.service.factory';
import { TrustScoreServiceFactory } from './trust-score.service.factory';

export class SealServiceFactory {
  static create() {
    return new SealService({
      sealRepositoryRead: new SealRepositoryRead(),
      sealRepositoryWrite: new SealRepositoryWrite(),
      trustEventService: TrustEventServiceFactory.create(),
      trustScoreService: TrustScoreServiceFactory.create(),
      eventPublisher: EventPublisherFactory.create(),
    });
  }
}
