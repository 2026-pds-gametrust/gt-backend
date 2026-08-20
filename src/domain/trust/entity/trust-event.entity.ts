import { requireNonEmptyString } from '../../common/types/required-string';
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
    requireNonEmptyString(event.id, 'id');
    requireNonEmptyString(event.sellerId, 'sellerId');
    if (!event.type) {
      throw new Error('type is required');
    }
    requireNonEmptyString(event.sourceEventId, 'sourceEventId');
    if (!event.payload || typeof event.payload !== 'object') {
      throw new Error('payload is required');
    }
  }
}
