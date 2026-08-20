import { createEventEnvelope } from '../../../../domain/common/messaging/event-envelope';
import { EOutboxStatus } from '../../../../domain/common/messaging/outbox/enums/EOutboxStatus';
import { IOutboxEntry } from '../../../../domain/common/messaging/outbox/outbox-entry.interface';
import { OutboxPoller } from '../../../../infraestructure/messaging/outbox/outbox.poller';

describe('when draining pending outbox entries', () => {
  const envelope = createEventEnvelope({
    eventId: 'evt-poller-1',
    eventType: 'payments.escrow.held',
    aggregateId: 'order-1',
    producerModule: 'payments',
    correlationId: 'corr-1',
    payload: { orderId: 'order-1' },
  });

  const pendingEntry: IOutboxEntry = {
    id: 'outbox-row-1',
    eventId: envelope.eventId,
    eventType: envelope.eventType,
    status: EOutboxStatus.PENDING,
    attempts: 0,
    envelope,
    createdAt: new Date(),
  };

  it('should publish pending entries and mark them published', async () => {
    const outboxRepositoryRead = {
      findPending: jest.fn().mockResolvedValue([pendingEntry]),
    };
    const outboxRepositoryWrite = {
      markPublished: jest.fn().mockResolvedValue(undefined),
      incrementAttempts: jest.fn(),
      markFailed: jest.fn(),
      enqueue: jest.fn(),
      updateStatus: jest.fn(),
    };
    const eventPublisher = {
      publish: jest.fn().mockResolvedValue(undefined),
    };

    const poller = new OutboxPoller({
      outboxRepositoryRead,
      outboxRepositoryWrite,
      eventPublisher,
    });

    const published = await poller.drainPending();

    expect(published).toBe(1);
    expect(eventPublisher.publish).toHaveBeenCalledWith(envelope);
    expect(outboxRepositoryWrite.markPublished).toHaveBeenCalledWith(
      pendingEntry.id,
      expect.any(Date),
    );
  });

  it('should increment attempts when publish fails and mark failed after max attempts', async () => {
    const exhaustedEntry: IOutboxEntry = {
      ...pendingEntry,
      attempts: 4,
    };

    const outboxRepositoryRead = {
      findPending: jest.fn().mockResolvedValue([exhaustedEntry]),
    };
    const outboxRepositoryWrite = {
      markPublished: jest.fn(),
      incrementAttempts: jest.fn().mockResolvedValue(undefined),
      markFailed: jest.fn().mockResolvedValue(undefined),
      enqueue: jest.fn(),
      updateStatus: jest.fn(),
    };
    const eventPublisher = {
      publish: jest.fn().mockRejectedValue(new Error('broker down')),
    };

    const poller = new OutboxPoller({
      outboxRepositoryRead,
      outboxRepositoryWrite,
      eventPublisher,
    });

    const published = await poller.drainPending();

    expect(published).toBe(0);
    expect(outboxRepositoryWrite.markFailed).toHaveBeenCalledWith(
      exhaustedEntry.id,
      5,
    );
    expect(outboxRepositoryWrite.incrementAttempts).not.toHaveBeenCalled();
  });
});
