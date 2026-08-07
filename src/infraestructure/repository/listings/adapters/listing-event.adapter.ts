import { IListingEvent } from '../../../../domain/listings/entity/interfaces/listing-event.interface';
import { IMListingEvent } from '../../../db/mongo/models/listing-event.model';

export function dbToInternal(doc: IMListingEvent): IListingEvent {
  return {
    id: doc.id,
    listingId: doc.listingId,
    fromStatus: doc.fromStatus ?? null,
    toStatus: doc.toStatus,
    reason: doc.reason,
    actorId: doc.actorId,
    occurredAt: doc.occurredAt,
  };
}

export function internalToDb(
  event: IListingEvent,
): Omit<IMListingEvent, '_id'> {
  return {
    id: event.id,
    listingId: event.listingId,
    fromStatus: event.fromStatus,
    toStatus: event.toStatus,
    reason: event.reason,
    actorId: event.actorId,
    occurredAt: event.occurredAt,
  };
}
