import { IEventEnvelope } from './event-envelope';
import { IEventHandler } from './event-handler.interface';

export type TEventHandlerMap = Record<string, IEventHandler[]>;

export interface IParamsDomainEventRouter {
  handlersByType: TEventHandlerMap;
}

/**
 * Routes enveloped events to one or more IEventHandler by eventType.
 * Unknown types are ignored (no-op) so producers can emit ahead of consumers.
 */
export class DomainEventRouter implements IEventHandler {
  private readonly handlersByType: TEventHandlerMap;

  constructor({ handlersByType }: IParamsDomainEventRouter) {
    this.handlersByType = handlersByType;
  }

  async handle(envelope: IEventEnvelope): Promise<void> {
    const handlers = this.handlersByType[envelope.eventType] ?? [];
    for (const handler of handlers) {
      await handler.handle(envelope);
    }
  }
}
