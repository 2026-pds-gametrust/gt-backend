import { ITrustEvent } from '../entity/interfaces/trust-event.interface';

export interface ITrustEventRepositoryRead {
  findTrustEventById(id: string): Promise<ITrustEvent | null>;
  findBySourceEventId(sourceEventId: string): Promise<ITrustEvent | null>;
  listBySellerId(sellerId: string): Promise<ITrustEvent[]>;
}
