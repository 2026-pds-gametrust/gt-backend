import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from '@aws-sdk/client-sqs';
import { Logger } from 'traceability';
import { IEventEnvelope } from '../../../domain/common/messaging/event-envelope';
import { IEventHandler } from '../../../domain/common/messaging/event-handler.interface';

/** Backoff after a receive failure so a broker outage does not spin the loop. */
const RECEIVE_RETRY_DELAY_MS = 5000;

/**
 * Long-poll SQS consumer skeleton (DEC-050 / DEC-053).
 * Parses envelope JSON and delegates to domain IEventHandler; deletes only after success.
 *
 * A message that fails to parse or whose handler throws is never deleted: it returns to
 * the queue so the redrive policy can count it toward the DLQ. Neither case may break the
 * polling loop — a single poison message must not stop event processing for the process.
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

      try {
        const envelope = JSON.parse(message.Body) as IEventEnvelope;
        await this.handler.handle(envelope);
      } catch (error) {
        // Leave the message on the queue: the redrive policy counts the retries and
        // moves it to the DLQ after maxReceiveCount.
        Logger.error(
          `SQS message failed for ${this.queueUrl}, left for redrive: ${String(error)}`,
          { eventName: 'sqs_message_error' },
        );
        continue;
      }

      await this.sqs.send(
        new DeleteMessageCommand({
          QueueUrl: this.queueUrl,
          ReceiptHandle: message.ReceiptHandle,
        }),
      );
    }
  }

  async start(): Promise<void> {
    if (!this.queueUrl) {
      // Misconfiguration fails fast; the loop below only tolerates runtime errors.
      throw new Error('SQS_QUEUE_URL is required');
    }

    this.running = true;
    while (this.running) {
      try {
        await this.pollOnce();
      } catch (error) {
        // Receive/delete failure (broker down, credentials, throttling). Keep polling —
        // stopping here would silently halt every domain event for the whole process.
        Logger.error(
          `SQS poll failed for ${this.queueUrl}: ${String(error)}`,
          { eventName: 'sqs_poll_error' },
        );
        await new Promise((resolve) =>
          setTimeout(resolve, RECEIVE_RETRY_DELAY_MS),
        );
      }
    }
  }

  stop(): void {
    this.running = false;
  }
}
