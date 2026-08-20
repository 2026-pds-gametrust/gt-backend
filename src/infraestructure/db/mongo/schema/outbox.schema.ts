import { Schema } from 'mongoose';
import { EOutboxStatus } from '../../../../domain/common/messaging/outbox/enums/EOutboxStatus';
import type { IMOutbox } from '../models/outbox.model';

export const OutboxSchema = new Schema<IMOutbox>(
  {
    id: { type: String, required: true, unique: true },
    eventId: { type: String, required: true, unique: true },
    eventType: { type: String, required: true, index: true },
    envelope: { type: Schema.Types.Mixed, required: true },
    status: {
      type: String,
      enum: Object.values(EOutboxStatus),
      required: true,
      default: EOutboxStatus.PENDING,
      index: true,
    },
    attempts: { type: Number, required: true, default: 0 },
    publishedAt: { type: Date },
  },
  { timestamps: true, collection: 'outbox' },
);

OutboxSchema.index({ status: 1, createdAt: 1 });
