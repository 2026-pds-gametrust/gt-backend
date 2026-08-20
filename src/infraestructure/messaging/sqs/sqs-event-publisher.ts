import {
  SNSClient,
  PublishCommand,
} from '@aws-sdk/client-sns';
import {
  SQSClient,
  SendMessageCommand,
} from '@aws-sdk/client-sqs';
import { IEventEnvelope } from '../../../domain/common/messaging/event-envelope';
import { IEventPublisher } from '../../../domain/common/messaging/event-publisher.interface';

/**
 * SNS/SQS publisher (DEC-050 / DEC-052).
 * Env: AWS_REGION, SNS_TOPIC_ARN (preferred) or SQS_QUEUE_URL.
 * No-op when MESSAGING_DISABLED=true, NODE_ENV=test, or no destination is set
 * (local yarn dev without broker). Explicit disabled:false still requires a destination.
 */
export class SqsEventPublisher implements IEventPublisher {
  private readonly sns: SNSClient;
  private readonly sqs: SQSClient;
  private readonly topicArn?: string;
  private readonly queueUrl?: string;
  private readonly disabled: boolean;

  constructor(options?: {
    region?: string;
    topicArn?: string;
    queueUrl?: string;
    endpoint?: string;
    disabled?: boolean;
  }) {
    const region = options?.region ?? process.env.AWS_REGION ?? 'us-east-1';
    const endpoint = options?.endpoint ?? process.env.AWS_ENDPOINT_URL;
    const clientConfig = endpoint ? { region, endpoint } : { region };
    this.sns = new SNSClient(clientConfig);
    this.sqs = new SQSClient(clientConfig);
    this.topicArn = options?.topicArn ?? process.env.SNS_TOPIC_ARN;
    this.queueUrl = options?.queueUrl ?? process.env.SQS_QUEUE_URL;
    this.disabled =
      options?.disabled ??
      (process.env.MESSAGING_DISABLED === 'true' ||
        process.env.NODE_ENV === 'test' ||
        (!this.topicArn && !this.queueUrl));
  }

  async publish(envelope: IEventEnvelope): Promise<void> {
    if (this.disabled) {
      return;
    }

    const body = JSON.stringify(envelope);

    if (this.topicArn) {
      await this.sns.send(
        new PublishCommand({
          TopicArn: this.topicArn,
          Message: body,
          MessageAttributes: {
            eventType: { DataType: 'String', StringValue: envelope.eventType },
          },
        }),
      );
      return;
    }

    if (this.queueUrl) {
      await this.sqs.send(
        new SendMessageCommand({
          QueueUrl: this.queueUrl,
          MessageBody: body,
        }),
      );
      return;
    }

    throw new Error('SNS_TOPIC_ARN or SQS_QUEUE_URL must be configured when messaging is enabled');
  }
}
