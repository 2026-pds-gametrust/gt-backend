import { ETrustEventType } from '../enums/ETrustEventType';

export interface ITrustEvent {
  id: string;
  sellerId: string;
  type: ETrustEventType;
  sourceEventId: string;
  payload: Record<string, unknown>;
  occurredAt: Date;
  createdAt: Date;
}
