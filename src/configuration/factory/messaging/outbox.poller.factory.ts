import { IOutboxPoller } from '../../../domain/common/messaging/outbox/outbox-poller.interface';
import { OutboxPoller } from '../../../infraestructure/messaging/outbox/outbox.poller';
import { OutboxRepositoryRead } from '../../../infraestructure/messaging/outbox/outbox.repository.read';
import { OutboxRepositoryWrite } from '../../../infraestructure/messaging/outbox/outbox.repository.write';
import { EventPublisherFactory } from './event-publisher.factory';

export class OutboxPollerFactory {
  private static instance: IOutboxPoller | null = null;

  static create(): IOutboxPoller {
    if (!this.instance) {
      this.instance = new OutboxPoller({
        outboxRepositoryRead: new OutboxRepositoryRead(),
        outboxRepositoryWrite: new OutboxRepositoryWrite(),
        eventPublisher: EventPublisherFactory.create(),
      });
    }
    return this.instance;
  }

  static resetForTests(): void {
    this.instance = null;
  }
}
