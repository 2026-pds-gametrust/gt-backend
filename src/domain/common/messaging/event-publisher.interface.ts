import { IEventEnvelope } from './event-envelope';

export interface IEventPublisher {
  publish(envelope: IEventEnvelope): Promise<void>;
}
