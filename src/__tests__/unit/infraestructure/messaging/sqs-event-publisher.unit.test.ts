import { SNSClient } from '@aws-sdk/client-sns';
import { SQSClient } from '@aws-sdk/client-sqs';
import { SqsEventPublisher } from '../../../../infraestructure/messaging/sqs/sqs-event-publisher';
import { createEventEnvelope } from '../../../../domain/common/messaging/event-envelope';

const envelope = createEventEnvelope({
  eventId: 'e1',
  eventType: 'identity.user.registered',
  aggregateId: 'u1',
  producerModule: 'identity',
  correlationId: 'c1',
  payload: { userId: 'u1' },
});

describe('when SQS event publisher publishes', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should no-op when disabled in test env by default', async () => {
    const snsSpy = jest.spyOn(SNSClient.prototype, 'send');
    const sqsSpy = jest.spyOn(SQSClient.prototype, 'send');
    const publisher = new SqsEventPublisher();
    await publisher.publish(envelope);
    expect(snsSpy).not.toHaveBeenCalled();
    expect(sqsSpy).not.toHaveBeenCalled();
  });

  it('should publish to SNS when topic ARN is configured', async () => {
    const snsSpy = jest
      .spyOn(SNSClient.prototype, 'send')
      .mockResolvedValue({} as never);
    const publisher = new SqsEventPublisher({
      disabled: false,
      topicArn: 'arn:aws:sns:us-east-1:123:topic',
    });
    await publisher.publish(envelope);
    expect(snsSpy).toHaveBeenCalled();
  });

  it('should publish to SQS when only queue URL is configured', async () => {
    const sqsSpy = jest
      .spyOn(SQSClient.prototype, 'send')
      .mockResolvedValue({} as never);
    const publisher = new SqsEventPublisher({
      disabled: false,
      queueUrl: 'https://sqs.example/queue',
    });
    await publisher.publish(envelope);
    expect(sqsSpy).toHaveBeenCalled();
  });

  it('should throw when messaging is enabled without destinations', async () => {
    const publisher = new SqsEventPublisher({ disabled: false });
    await expect(publisher.publish(envelope)).rejects.toThrow(
      'SNS_TOPIC_ARN or SQS_QUEUE_URL must be configured when messaging is enabled',
    );
  });

  it('should no-op in development when destinations are not configured', async () => {
    const previousNodeEnv = process.env.NODE_ENV;
    const previousTopicArn = process.env.SNS_TOPIC_ARN;
    const previousQueueUrl = process.env.SQS_QUEUE_URL;
    const previousMessagingDisabled = process.env.MESSAGING_DISABLED;
    process.env.NODE_ENV = 'development';
    delete process.env.SNS_TOPIC_ARN;
    delete process.env.SQS_QUEUE_URL;
    delete process.env.MESSAGING_DISABLED;

    try {
      const snsSpy = jest.spyOn(SNSClient.prototype, 'send');
      const sqsSpy = jest.spyOn(SQSClient.prototype, 'send');
      const publisher = new SqsEventPublisher();
      await publisher.publish(envelope);
      expect(snsSpy).not.toHaveBeenCalled();
      expect(sqsSpy).not.toHaveBeenCalled();
    } finally {
      process.env.NODE_ENV = previousNodeEnv;
      if (previousTopicArn === undefined) {
        delete process.env.SNS_TOPIC_ARN;
      } else {
        process.env.SNS_TOPIC_ARN = previousTopicArn;
      }
      if (previousQueueUrl === undefined) {
        delete process.env.SQS_QUEUE_URL;
      } else {
        process.env.SQS_QUEUE_URL = previousQueueUrl;
      }
      if (previousMessagingDisabled === undefined) {
        delete process.env.MESSAGING_DISABLED;
      } else {
        process.env.MESSAGING_DISABLED = previousMessagingDisabled;
      }
    }
  });
});
