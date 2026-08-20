import { Schema } from 'mongoose';
import { EChatReportTargetType } from '../../../../domain/listing-chat/entity/enums/EChatReportTargetType';
import type { IMChatReport } from '../models/listing-chat-report.model';

export const ListingChatReportSchema = new Schema<IMChatReport>(
  {
    id: { type: String, required: true, unique: true },
    reporterId: { type: String, required: true, index: true },
    targetType: {
      type: String,
      enum: Object.values(EChatReportTargetType),
      required: true,
    },
    targetId: { type: String, required: true },
    conversationId: { type: String, required: true, index: true },
    reason: { type: String, required: true },
  },
  {
    timestamps: true,
    collection: 'listing_chat_reports',
  },
);

ListingChatReportSchema.index(
  { reporterId: 1, targetType: 1, targetId: 1 },
  { unique: true },
);
ListingChatReportSchema.index({ createdAt: -1 });
