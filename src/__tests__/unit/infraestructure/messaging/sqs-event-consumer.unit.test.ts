import {
  DeleteMessageCommand,
  ReceiveMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';
import { SqsEventConsumer } from '../../../../infraestructure/messaging/sqs/sqs-event-consumer';
import { IEventHandler } from '../../../../domain/common/messaging/event-handler.interface';

jest.mock('@aws-sdk/client-sqs', () => {
  const send = jest.fn();
  return {
    SQSClient: jest.fn().mockImplementation(() => ({ send })),
    ReceiveMessageCommand: jest.fn().mockImplementation((input) => input),
    DeleteMessageCommand: jest.fn().mockImplementation((input) => input),
  };
});

describe('when SQS event consumer polls', () => {
  const send = new SQSClient({}).send as jest.Mock;
  const handler: IEventHandler = {
    handle: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    send.mockReset();
    (handler.handle as jest.Mock).mockClear();
    delete process.env.SQS_QUEUE_URL;
  });

  it('should throw when queue URL is missing', async () => {
    const consumer = new SqsEventConsumer({ handler });
    await expect(consumer.pollOnce()).rejects.toThrow(
      'SQS_QUEUE_URL is required',
    );
  });

  it('should handle messages and delete them after success', async () => {
    process.env.SQS_QUEUE_URL = 'https://sqs.example/queue';
    const envelope = {
      eventId: 'e1',
      eventType: 'listings.listing.published',
      occurredAt: new Date().toISOString(),
      aggregateId: 'a1',
      producerModule: 'listings',
      correlationId: 'c1',
      payload: {},
    };
    send
      .mockResolvedValueOnce({
        Messages: [
          {
            Body: JSON.stringify(envelope),
            ReceiptHandle: 'rh-1',
          },
          {
            Body: undefined,
            ReceiptHandle: 'rh-skip',
          },
        ],
      })
      .mockResolvedValueOnce({});

    const consumer = new SqsEventConsumer({
      handler,
      queueUrl: process.env.SQS_QUEUE_URL,
    });
    await consumer.pollOnce();

    expect(handler.handle).toHaveBeenCalledWith(
      expect.objectContaining({ eventId: 'e1' }),
    );
    expect(ReceiveMessageCommand).toHaveBeenCalled();
    expect(DeleteMessageCommand).toHaveBeenCalledWith(
      expect.objectContaining({ ReceiptHandle: 'rh-1' }),
    );
  });

  it('should stop the start loop when stop is called', async () => {
    process.env.SQS_QUEUE_URL = 'https://sqs.example/queue';
    send.mockImplementation(async () => {
      consumer.stop();
      return { Messages: [] };
    });

    const consumer = new SqsEventConsumer({
      handler,
      queueUrl: process.env.SQS_QUEUE_URL,
    });
    await consumer.start();
    expect(send).toHaveBeenCalled();
  });
});
