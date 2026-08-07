import {
  isInProcessDispatchEnabled,
  isSqsConsumersEnabled,
  resolveConsumerQueueUrls,
} from '../../../configuration/env-constants/messaging.env';

describe('when resolving messaging env flags', () => {
  const original = { ...process.env };

  afterEach(() => {
    process.env = { ...original };
  });

  it('should detect SQS consumers enabled only when true', () => {
    process.env.SQS_CONSUMERS_ENABLED = 'true';
    expect(isSqsConsumersEnabled()).toBe(true);
    process.env.SQS_CONSUMERS_ENABLED = 'false';
    expect(isSqsConsumersEnabled()).toBe(false);
  });

  it('should honor explicit EVENT_INPROCESS_DISPATCH', () => {
    process.env.EVENT_INPROCESS_DISPATCH = 'true';
    expect(isInProcessDispatchEnabled()).toBe(true);
    process.env.EVENT_INPROCESS_DISPATCH = 'false';
    expect(isInProcessDispatchEnabled()).toBe(false);
  });

  it('should default in-process dispatch to inverse of consumers flag', () => {
    delete process.env.EVENT_INPROCESS_DISPATCH;
    process.env.SQS_CONSUMERS_ENABLED = 'true';
    expect(isInProcessDispatchEnabled()).toBe(false);
    process.env.SQS_CONSUMERS_ENABLED = 'false';
    expect(isInProcessDispatchEnabled()).toBe(true);
  });

  it('should parse multi queue URLs and fall back to single', () => {
    process.env.SQS_CONSUMER_QUEUE_URLS = ' https://q1 , https://q2 , ';
    expect(resolveConsumerQueueUrls()).toEqual([
      'https://q1',
      'https://q2',
    ]);

    delete process.env.SQS_CONSUMER_QUEUE_URLS;
    process.env.SQS_QUEUE_URL = 'https://single';
    expect(resolveConsumerQueueUrls()).toEqual(['https://single']);

    delete process.env.SQS_QUEUE_URL;
    expect(resolveConsumerQueueUrls()).toEqual([]);
  });
});
