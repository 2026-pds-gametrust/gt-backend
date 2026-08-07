import { IEventPublisher } from '../../../common/messaging/event-publisher.interface';
import { IEventEnvelope } from '../../../common/messaging/event-envelope';

export type IIdentityUserVerifiedPayload = {
  userId: string;
};

export interface IIdentityUserVerifiedProducer {
  publish(envelope: IEventEnvelope<IIdentityUserVerifiedPayload>): Promise<void>;
}

export class IdentityUserVerifiedProducer implements IIdentityUserVerifiedProducer {
  constructor(private readonly publisher: IEventPublisher) {}

  async publish(envelope: IEventEnvelope<IIdentityUserVerifiedPayload>): Promise<void> {
    await this.publisher.publish(envelope);
  }
}
