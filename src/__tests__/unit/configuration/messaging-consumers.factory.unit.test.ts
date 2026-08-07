import { MessagingConsumersFactory } from '../../../configuration/factory/messaging/messaging-consumers.factory';
import { SqsEventConsumer } from '../../../infraestructure/messaging/sqs/sqs-event-consumer';
import * as messagingEnv from '../../../configuration/env-constants/messaging.env';

jest.mock('../../../infraestructure/messaging/sqs/sqs-event-consumer', () => {
  return {
    SqsEventConsumer: jest.fn().mockImplementation(() => ({
      start: jest.fn().mockResolvedValue(undefined),
      stop: jest.fn(),
    })),
  };
});

describe('when MessagingConsumersFactory starts consumers', () => {
  afterEach(() => {
    MessagingConsumersFactory.stop();
    jest.restoreAllMocks();
  });

  it('should no-op when consumers are disabled', () => {
    jest.spyOn(messagingEnv, 'isSqsConsumersEnabled').mockReturnValue(false);
    MessagingConsumersFactory.start();
    expect(SqsEventConsumer).not.toHaveBeenCalled();
  });

  it('should skip when enabled but no queue URLs', () => {
    jest.spyOn(messagingEnv, 'isSqsConsumersEnabled').mockReturnValue(true);
    jest.spyOn(messagingEnv, 'resolveConsumerQueueUrls').mockReturnValue([]);
    MessagingConsumersFactory.start();
    expect(SqsEventConsumer).not.toHaveBeenCalled();
  });

  it('should start one consumer per queue URL and stop them', () => {
    jest.spyOn(messagingEnv, 'isSqsConsumersEnabled').mockReturnValue(true);
    jest
      .spyOn(messagingEnv, 'resolveConsumerQueueUrls')
      .mockReturnValue(['https://q1', 'https://q2']);

    MessagingConsumersFactory.start();
    expect(SqsEventConsumer).toHaveBeenCalledTimes(2);

    MessagingConsumersFactory.stop();
  });
});
