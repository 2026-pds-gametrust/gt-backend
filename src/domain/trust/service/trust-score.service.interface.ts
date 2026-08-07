import { IEventPublisher } from '../../common/messaging/event-publisher.interface';
import { ITrustScore } from '../entity/interfaces/trust-score.interface';
import { ITrustEventRepositoryRead } from '../repository/trust-event.repository.read';
import { ITrustScoreRepositoryRead } from '../repository/trust-score.repository.read';
import { ITrustScoreRepositoryWrite } from '../repository/trust-score.repository.write';
import { ISellerLevelService } from './seller-level.service.interface';

export interface IParamsTrustScoreService {
  trustScoreRepositoryRead: ITrustScoreRepositoryRead;
  trustScoreRepositoryWrite: ITrustScoreRepositoryWrite;
  trustEventRepositoryRead: ITrustEventRepositoryRead;
  sellerLevelService: ISellerLevelService;
  eventPublisher: IEventPublisher;
}

export interface ITrustScoreService {
  recomputeForSeller(sellerId: string): Promise<ITrustScore>;
  getTrustScoreBySellerId(sellerId: string): Promise<ITrustScore>;
}
