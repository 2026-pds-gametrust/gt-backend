import { IEventEnvelope } from '../event-envelope';
import { EOutboxStatus } from './enums/EOutboxStatus';

export interface IOutboxEntry {
  id: string;
  eventId: string;
  eventType: string;
  envelope: IEventEnvelope;
  status: EOutboxStatus;
  attempts: number;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
}
