import { IEventPublisher } from '../../common/messaging/event-publisher.interface';
import { ITrustEventService } from '../../trust/service/trust-event.service.interface';
import { ITrustScoreService } from '../../trust/service/trust-score.service.interface';
import { ESealType } from '../entity/enums/ESealType';
import { ISeal } from '../entity/interfaces/seal.interface';
import { ISealRepositoryRead } from '../repository/seal.repository.read';
import { ISealRepositoryWrite } from '../repository/seal.repository.write';

export interface IParamsGrantSeal {
  id: string;
  listingId: string;
  caseId: string;
  type: ESealType;
  sellerId: string;
  sourceEventId: string;
}

export interface IParamsSealService {
  sealRepositoryRead: ISealRepositoryRead;
  sealRepositoryWrite: ISealRepositoryWrite;
  trustEventService: ITrustEventService;
  trustScoreService: ITrustScoreService;
  eventPublisher: IEventPublisher;
}

export interface ISealService {
  grantSeal(params: IParamsGrantSeal): Promise<ISeal>;
  revokeSeal(id: string, sellerId: string): Promise<ISeal>;
  getSealById(id: string): Promise<ISeal>;
  listSealsByListingId(listingId: string): Promise<ISeal[]>;
}
