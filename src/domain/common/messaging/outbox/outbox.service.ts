import { randomUUID } from 'crypto';
import { IEventEnvelope } from '../event-envelope';
import { IOutboxEntry } from './outbox-entry.interface';
import { IOutboxRepositoryWrite, IOutboxSession } from './outbox.repository.write';
import { EOutboxStatus } from './enums/EOutboxStatus';

export interface IParamsOutboxService {
  outboxRepositoryWrite: IOutboxRepositoryWrite;
}

export class OutboxService {
  private readonly outboxRepositoryWrite: IOutboxRepositoryWrite;

  constructor({ outboxRepositoryWrite }: IParamsOutboxService) {
    this.outboxRepositoryWrite = outboxRepositoryWrite;
  }

  async enqueue(
    envelope: IEventEnvelope,
    session?: IOutboxSession,
  ): Promise<IOutboxEntry> {
    return this.outboxRepositoryWrite.enqueue(envelope, session);
  }

  buildEntryId(): string {
    return randomUUID();
  }
}

export { EOutboxStatus };
