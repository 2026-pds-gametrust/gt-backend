import { ETrustEventType } from './enums/ETrustEventType';
import { ITrustEvent } from './interfaces/trust-event.interface';

export class TrustEventServiceEntity implements ITrustEvent {
  id: string;
  sellerId: string;
  type: ETrustEventType;
  sourceEventId: string;
  payload: Record<string, unknown>;
  occurredAt: Date;
  createdAt: Date;

  constructor(event: ITrustEvent) {
    this.validate(event);
    this.id = event.id;
    this.sellerId = event.sellerId.trim();
    this.type = event.type;
    this.sourceEventId = event.sourceEventId.trim();
    this.payload = { ...event.payload };
    this.occurredAt = event.occurredAt || new Date();
    this.createdAt = event.createdAt || new Date();
  }

  private validate(event: ITrustEvent): void {
    if (!event.id?.trim()) {
      throw new Error('id is required');
    }
    if (!event.sellerId?.trim()) {
      throw new Error('sellerId is required');
    }
    if (!event.type) {
      throw new Error('type is required');
    }
    if (!event.sourceEventId?.trim()) {
      throw new Error('sourceEventId is required');
    }
    if (!event.payload || typeof event.payload !== 'object') {
      throw new Error('payload is required');
    }
  }
}
