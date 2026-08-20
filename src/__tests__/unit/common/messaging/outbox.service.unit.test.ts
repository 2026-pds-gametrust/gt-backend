import { createEventEnvelope } from '../../../../domain/common/messaging/event-envelope';
import { EOutboxStatus } from '../../../../domain/common/messaging/outbox/enums/EOutboxStatus';
import { OutboxService } from '../../../../domain/common/messaging/outbox/outbox.service';
import {
  IOutboxRepositoryWrite,
  IOutboxSession,
} from '../../../../domain/common/messaging/outbox/outbox.repository.write';

describe('when enqueueing an outbox event', () => {
  it('should delegate enqueue to the write repository with optional session', async () => {
    const envelope = createEventEnvelope({
      eventId: 'evt-outbox-1',
      eventType: 'orders.order.created',
      aggregateId: 'order-1',
      producerModule: 'orders',
      correlationId: 'corr-1',
      payload: { orderId: 'order-1' },
    });

    const session = { token: 'session-1' } as IOutboxSession;
    const entry = {
      id: 'outbox-1',
      eventId: envelope.eventId,
      eventType: envelope.eventType,
      status: EOutboxStatus.PENDING,
      attempts: 0,
      envelope,
      createdAt: new Date(),
    };

    const outboxRepositoryWrite: IOutboxRepositoryWrite = {
      enqueue: jest.fn().mockResolvedValue(entry),
      markPublished: jest.fn(),
      markFailed: jest.fn(),
      updateStatus: jest.fn(),
      incrementAttempts: jest.fn(),
    };

    const service = new OutboxService({ outboxRepositoryWrite });
    const result = await service.enqueue(envelope, session);

    expect(outboxRepositoryWrite.enqueue).toHaveBeenCalledWith(
      envelope,
      session,
    );
    expect(result).toBe(entry);
  });

  it('should generate unique entry ids', () => {
    const outboxRepositoryWrite: IOutboxRepositoryWrite = {
      enqueue: jest.fn(),
      markPublished: jest.fn(),
      markFailed: jest.fn(),
      updateStatus: jest.fn(),
      incrementAttempts: jest.fn(),
    };

    const service = new OutboxService({ outboxRepositoryWrite });
    const first = service.buildEntryId();
    const second = service.buildEntryId();

    expect(first).not.toBe(second);
  });
});
