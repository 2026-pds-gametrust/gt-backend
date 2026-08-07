import { IEventEnvelope } from './event-envelope';
import { IEventHandler } from './event-handler.interface';
import { IEventPublisher } from './event-publisher.interface';

export interface IParamsDispatchingEventPublisher {
  transport: IEventPublisher;
  getHandler: () => IEventHandler;
  inProcessDispatch: boolean;
}

/**
 * Publishes via transport, then optionally dispatches the same envelope
 * to a domain IEventHandler (typically DomainEventRouter) for broker-less tests.
 */
export class DispatchingEventPublisher implements IEventPublisher {
  private readonly transport: IEventPublisher;
  private readonly getHandler: () => IEventHandler;
  private readonly inProcessDispatch: boolean;

  constructor({
    transport,
    getHandler,
    inProcessDispatch,
  }: IParamsDispatchingEventPublisher) {
    this.transport = transport;
    this.getHandler = getHandler;
    this.inProcessDispatch = inProcessDispatch;
  }

  async publish(envelope: IEventEnvelope): Promise<void> {
    await this.transport.publish(envelope);
    if (this.inProcessDispatch) {
      await this.getHandler().handle(envelope);
    }
  }
}
