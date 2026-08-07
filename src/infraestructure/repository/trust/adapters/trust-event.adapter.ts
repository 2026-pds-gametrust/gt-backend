import { ITrustEvent } from '../../../../domain/trust/entity/interfaces/trust-event.interface';
import { IMTrustEvent } from '../../../db/mongo/models/trust-event.model';

export function dbToInternal(doc: IMTrustEvent): ITrustEvent {
  return {
    id: doc.id,
    sellerId: doc.sellerId,
    type: doc.type,
    sourceEventId: doc.sourceEventId,
    payload: doc.payload,
    occurredAt: doc.occurredAt,
    createdAt: doc.createdAt,
  };
}

export function internalToDb(
  event: ITrustEvent,
): Omit<IMTrustEvent, '_id' | 'createdAt'> {
  return {
    id: event.id,
    sellerId: event.sellerId,
    type: event.type,
    sourceEventId: event.sourceEventId,
    payload: event.payload,
    occurredAt: event.occurredAt,
  };
}
