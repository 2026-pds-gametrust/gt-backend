/**
 * Messaging runtime flags (E22).
 *
 * - SQS_CONSUMERS_ENABLED=true → start SQS pollers after DB setup
 * - EVENT_INPROCESS_DISPATCH → when unset, defaults to true unless consumers enabled
 *   (Jest / local without broker keep the same domain handlers)
 */
export function isSqsConsumersEnabled(): boolean {
  return process.env.SQS_CONSUMERS_ENABLED === 'true';
}

export function isInProcessDispatchEnabled(): boolean {
  if (process.env.EVENT_INPROCESS_DISPATCH !== undefined) {
    return process.env.EVENT_INPROCESS_DISPATCH === 'true';
  }
  return !isSqsConsumersEnabled();
}

export function resolveConsumerQueueUrls(): string[] {
  const multi = process.env.SQS_CONSUMER_QUEUE_URLS;
  if (multi?.trim()) {
    return multi
      .split(',')
      .map((url) => url.trim())
      .filter(Boolean);
  }
  const single = process.env.SQS_QUEUE_URL?.trim();
  return single ? [single] : [];
}
