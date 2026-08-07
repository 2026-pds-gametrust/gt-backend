import { IEventPublisher } from '../../../domain/common/messaging/event-publisher.interface';
import { createEventEnvelope } from '../../../domain/common/messaging/event-envelope';

describe('when a service publishes through IEventPublisher', () => {
  it('should assert via spy without talking to a broker', async () => {
    const publisher: IEventPublisher = {
      publish: jest.fn().mockResolvedValue(undefined),
    };

    const envelope = createEventEnvelope({
      eventId: 'evt-2',
      eventType: 'identity.user.registered',
      aggregateId: 'user-1',
      producerModule: 'identity',
      correlationId: 'corr-2',
      payload: { userId: 'user-1' },
    });

    await publisher.publish(envelope);

    expect(publisher.publish).toHaveBeenCalledTimes(1);
    expect(publisher.publish).toHaveBeenCalledWith(envelope);
  });
});
