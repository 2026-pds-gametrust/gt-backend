import { createEventEnvelope } from '../../../domain/common/messaging/event-envelope';

describe('when building an event envelope', () => {
  it('should include required DEC-031 fields', () => {
    const envelope = createEventEnvelope({
      eventId: 'evt-1',
      eventType: 'catalog.category.created',
      aggregateId: 'cat-1',
      producerModule: 'catalog',
      correlationId: 'corr-1',
      payload: { slug: 'gpus' },
    });

    expect(envelope.eventId).toBe('evt-1');
    expect(envelope.eventType).toBe('catalog.category.created');
    expect(envelope.schemaVersion).toBe(1);
    expect(envelope.aggregateId).toBe('cat-1');
    expect(envelope.producerModule).toBe('catalog');
    expect(envelope.correlationId).toBe('corr-1');
    expect(envelope.payload).toEqual({ slug: 'gpus' });
    expect(envelope.occurredAt).toBeDefined();
  });
});
