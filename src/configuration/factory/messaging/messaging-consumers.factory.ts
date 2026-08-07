import { Logger } from 'traceability';
import { IEventHandler } from '../../../domain/common/messaging/event-handler.interface';
import { SqsEventConsumer } from '../../../infraestructure/messaging/sqs/sqs-event-consumer';
import {
  isSqsConsumersEnabled,
  resolveConsumerQueueUrls,
} from '../../env-constants/messaging.env';
import { EventPublisherFactory } from './event-publisher.factory';

/**
 * Starts long-poll SQS consumers when SQS_CONSUMERS_ENABLED=true.
 * All queues share DomainEventRouter (same handlers as in-process dispatch).
 */
export class MessagingConsumersFactory {
  private static consumers: SqsEventConsumer[] = [];

  static start(): void {
    if (!isSqsConsumersEnabled()) {
      return;
    }

    const queueUrls = resolveConsumerQueueUrls();
    if (queueUrls.length === 0) {
      Logger.info(
        'SQS_CONSUMERS_ENABLED but no SQS_QUEUE_URL / SQS_CONSUMER_QUEUE_URLS configured',
        { eventName: 'sqs_consumers_skipped' },
      );
      return;
    }

    const handler: IEventHandler = EventPublisherFactory.getRouter();

    for (const queueUrl of queueUrls) {
      const consumer = new SqsEventConsumer({ handler, queueUrl });
      this.consumers.push(consumer);
      void consumer.start().catch((error) => {
        Logger.error(`SQS consumer failed for ${queueUrl}: ${String(error)}`, {
          eventName: 'sqs_consumer_error',
        });
      });
    }

    Logger.info(`Started ${this.consumers.length} SQS consumer(s)`, {
      eventName: 'sqs_consumers_started',
    });
  }

  static stop(): void {
    for (const consumer of this.consumers) {
      consumer.stop();
    }
    this.consumers = [];
  }
}
