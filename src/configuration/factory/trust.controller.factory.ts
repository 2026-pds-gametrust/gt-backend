import { TrustController } from '../../application/controllers/trust.controller';
import { IController } from '../../domain/server/interfaces/IController';
import { SellerLevelServiceFactory } from './seller-level.service.factory';
import { TrustEventServiceFactory } from './trust-event.service.factory';
import { TrustScoreServiceFactory } from './trust-score.service.factory';

export class TrustControllerFactory {
  static create(): IController {
    return new TrustController(
      TrustEventServiceFactory.create(),
      TrustScoreServiceFactory.create(),
      SellerLevelServiceFactory.create(),
    );
  }
}
