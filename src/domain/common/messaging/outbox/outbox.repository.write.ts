import { IEventEnvelope } from '../event-envelope';
import { IOutboxEntry } from './outbox-entry.interface';
import { EOutboxStatus } from './enums/EOutboxStatus';

export interface IOutboxSession {
  readonly token: unknown;
}

export interface IOutboxRepositoryWrite {
  enqueue(
    envelope: IEventEnvelope,
    session?: IOutboxSession,
  ): Promise<IOutboxEntry>;
  markPublished(id: string, publishedAt: Date): Promise<void>;
  markFailed(id: string, attempts: number): Promise<void>;
  updateStatus(
    id: string,
    status: EOutboxStatus,
    session?: IOutboxSession,
  ): Promise<void>;
  incrementAttempts(id: string, attempts: number): Promise<void>;
}
