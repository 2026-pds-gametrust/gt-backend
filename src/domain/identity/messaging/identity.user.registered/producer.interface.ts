import { IEventPublisher } from '../../../common/messaging/event-publisher.interface';
import { IEventEnvelope } from '../../../common/messaging/event-envelope';

export type IIdentityUserRegisteredPayload = {
  userId: string;
};

export interface IIdentityUserRegisteredProducer {
  publish(envelope: IEventEnvelope<IIdentityUserRegisteredPayload>): Promise<void>;
}

export class IdentityUserRegisteredProducer implements IIdentityUserRegisteredProducer {
  constructor(private readonly publisher: IEventPublisher) {}

  async publish(envelope: IEventEnvelope<IIdentityUserRegisteredPayload>): Promise<void> {
    await this.publisher.publish(envelope);
  }
}
