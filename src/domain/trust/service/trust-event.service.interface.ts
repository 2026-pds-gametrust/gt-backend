import { ETrustEventType } from '../entity/enums/ETrustEventType';
import { ITrustEvent } from '../entity/interfaces/trust-event.interface';
import { ITrustEventRepositoryRead } from '../repository/trust-event.repository.read';
import { ITrustEventRepositoryWrite } from '../repository/trust-event.repository.write';

export interface IParamsAppendTrustEvent {
  id: string;
  sellerId: string;
  type: ETrustEventType;
  sourceEventId: string;
  payload: Record<string, unknown>;
  occurredAt?: Date;
}

export interface IParamsTrustEventService {
  trustEventRepositoryRead: ITrustEventRepositoryRead;
  trustEventRepositoryWrite: ITrustEventRepositoryWrite;
}

export interface ITrustEventService {
  appendTrustEvent(params: IParamsAppendTrustEvent): Promise<ITrustEvent>;
  listBySellerId(sellerId: string): Promise<ITrustEvent[]>;
  getTrustEventById(id: string): Promise<ITrustEvent>;
}
