import { Logger } from 'traceability';
import { IEventPublisher } from '../../../domain/common/messaging/event-publisher.interface';
import { IOutboxPoller } from '../../../domain/common/messaging/outbox/outbox-poller.interface';
import { IOutboxRepositoryRead } from '../../../domain/common/messaging/outbox/outbox.repository.read';
import { IOutboxRepositoryWrite } from '../../../domain/common/messaging/outbox/outbox.repository.write';

const DEFAULT_BATCH_SIZE = 50;
const MAX_ATTEMPTS = 5;

export interface IParamsOutboxPoller {
  outboxRepositoryRead: IOutboxRepositoryRead;
  outboxRepositoryWrite: IOutboxRepositoryWrite;
  eventPublisher: IEventPublisher;
}

export class OutboxPoller implements IOutboxPoller {
  private readonly outboxRepositoryRead: IOutboxRepositoryRead;
  private readonly outboxRepositoryWrite: IOutboxRepositoryWrite;
  private readonly eventPublisher: IEventPublisher;

  constructor(params: IParamsOutboxPoller) {
    this.outboxRepositoryRead = params.outboxRepositoryRead;
    this.outboxRepositoryWrite = params.outboxRepositoryWrite;
    this.eventPublisher = params.eventPublisher;
  }

  async drainPending(limit = DEFAULT_BATCH_SIZE): Promise<number> {
    const pending = await this.outboxRepositoryRead.findPending(limit);
    let published = 0;

    for (const entry of pending) {
      try {
        await this.eventPublisher.publish(entry.envelope);
        await this.outboxRepositoryWrite.markPublished(entry.id, new Date());
        published += 1;
      } catch (error) {
        const attempts = entry.attempts + 1;
        Logger.error(
          `Outbox publish failed for ${entry.id}: ${String(error)}`,
          { eventName: 'outbox_publish_failed', eventId: entry.eventId },
        );
        if (attempts >= MAX_ATTEMPTS) {
          await this.outboxRepositoryWrite.markFailed(entry.id, attempts);
        } else {
          await this.outboxRepositoryWrite.incrementAttempts(entry.id, attempts);
        }
      }
    }

    return published;
  }
}
