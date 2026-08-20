import { DispatchingEventPublisher } from '../../../domain/common/messaging/dispatching-event-publisher';
import { DomainEventRouter } from '../../../domain/common/messaging/domain-event-router';
import { IEventPublisher } from '../../../domain/common/messaging/event-publisher.interface';
import { SqsEventPublisher } from '../../../infraestructure/messaging/sqs/sqs-event-publisher';
import { isInProcessDispatchEnabled } from '../../env-constants/messaging.env';

export class EventPublisherFactory {
  private static instance: IEventPublisher | null = null;
  private static router: DomainEventRouter | null = null;

  static create(): IEventPublisher {
    if (!this.instance) {
      this.instance = new DispatchingEventPublisher({
        transport: new SqsEventPublisher(),
        getHandler: () => EventPublisherFactory.getRouter(),
        inProcessDispatch: isInProcessDispatchEnabled(),
      });
    }
    return this.instance;
  }

  /**
   * Lazy router build — avoids circular factory deps at module load /
   * first EventPublisherFactory.create() (services need the publisher first).
   */
  static getRouter(): DomainEventRouter {
    if (!this.router) {
      // Deferred require breaks EventPublisherFactory ↔ DomainEventRouterFactory cycle.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const {
        DomainEventRouterFactory,
      } = require('./domain-event-router.factory') as typeof import('./domain-event-router.factory');
      this.router = DomainEventRouterFactory.create();
    }
    return this.router!;
  }

  /** Test helper — reset singletons between suites if needed. */
  static resetForTests(): void {
    this.instance = null;
    this.router = null;
  }
}
