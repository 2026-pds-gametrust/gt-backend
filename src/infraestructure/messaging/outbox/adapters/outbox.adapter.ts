import { IEventEnvelope } from '../../../../domain/common/messaging/event-envelope';
import { IOutboxEntry } from '../../../../domain/common/messaging/outbox/outbox-entry.interface';
import { EOutboxStatus } from '../../../../domain/common/messaging/outbox/enums/EOutboxStatus';
import { IMOutbox } from '../../../db/mongo/models/outbox.model';

export function dbToInternal(doc: IMOutbox): IOutboxEntry {
  return {
    id: doc.id,
    eventId: doc.eventId,
    eventType: doc.eventType,
    envelope: doc.envelope,
    status: doc.status,
    attempts: doc.attempts,
    publishedAt: doc.publishedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export function internalToDb(params: {
  id: string;
  envelope: IEventEnvelope;
  status: EOutboxStatus;
  attempts: number;
}): Omit<IMOutbox, '_id' | 'createdAt' | 'updatedAt' | 'publishedAt'> {
  return {
    id: params.id,
    eventId: params.envelope.eventId,
    eventType: params.envelope.eventType,
    envelope: params.envelope,
    status: params.status,
    attempts: params.attempts,
  };
}
