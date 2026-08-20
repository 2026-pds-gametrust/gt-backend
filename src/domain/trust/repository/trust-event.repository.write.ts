import { ITrustEvent } from '../entity/interfaces/trust-event.interface';

export interface ITrustEventRepositoryWrite {
  appendTrustEvent(event: ITrustEvent): Promise<ITrustEvent>;
}
