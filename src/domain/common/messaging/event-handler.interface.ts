import { IEventEnvelope } from './event-envelope';

export interface IEventHandler {
  handle(envelope: IEventEnvelope): Promise<void>;
}
