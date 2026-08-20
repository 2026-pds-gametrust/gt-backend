import { Schema } from 'mongoose';
import { ETrustEventType } from '../../../../domain/trust/entity/enums/ETrustEventType';
import type { IMTrustEvent } from '../models/trust-event.model';

export const TrustEventSchema = new Schema<IMTrustEvent>(
  {
    id: { type: String, required: true, unique: true },
    sellerId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: Object.values(ETrustEventType),
      required: true,
    },
    sourceEventId: { type: String, required: true, unique: true },
    payload: { type: Schema.Types.Mixed, required: true },
    occurredAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: 'trust_events' },
);
