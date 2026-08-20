import { IOutboxEntry } from './outbox-entry.interface';

export interface IOutboxRepositoryRead {
  findPending(limit: number): Promise<IOutboxEntry[]>;
}
