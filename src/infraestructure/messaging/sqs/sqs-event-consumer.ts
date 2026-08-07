import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from '@aws-sdk/client-sqs';
import { IEventEnvelope } from '../../../domain/common/messaging/event-envelope';
import { IEventHandler } from '../../../domain/common/messaging/event-handler.interface';

/**
 * Long-poll SQS consumer skeleton (DEC-050 / DEC-053).
 * Parses envelope JSON and delegates to domain IEventHandler; deletes only after success.
 */
export class SqsEventConsumer {
  private readonly sqs: SQSClient;
  private readonly queueUrl: string;
  private readonly handler: IEventHandler;
  private running = false;

  constructor(params: {
    handler: IEventHandler;
    queueUrl?: string;
    region?: string;
    endpoint?: string;
  }) {
    const region = params.region ?? process.env.AWS_REGION ?? 'us-east-1';
    const endpoint = params.endpoint ?? process.env.AWS_ENDPOINT_URL;
    const clientConfig = endpoint ? { region, endpoint } : { region };
    this.sqs = new SQSClient(clientConfig);
    this.queueUrl = params.queueUrl ?? process.env.SQS_QUEUE_URL ?? '';
    this.handler = params.handler;
  }

  async pollOnce(): Promise<void> {
    if (!this.queueUrl) {
      throw new Error('SQS_QUEUE_URL is required');
    }

    const response = await this.sqs.send(
      new ReceiveMessageCommand({
        QueueUrl: this.queueUrl,
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 20,
      }),
    );

    for (const message of response.Messages ?? []) {
      if (!message.Body || !message.ReceiptHandle) {
        continue;
      }
      const envelope = JSON.parse(message.Body) as IEventEnvelope;
      await this.handler.handle(envelope);
      await this.sqs.send(
        new DeleteMessageCommand({
          QueueUrl: this.queueUrl,
          ReceiptHandle: message.ReceiptHandle,
        }),
      );
    }
  }

  async start(): Promise<void> {
    this.running = true;
    while (this.running) {
      await this.pollOnce();
    }
  }

  stop(): void {
    this.running = false;
  }
}
