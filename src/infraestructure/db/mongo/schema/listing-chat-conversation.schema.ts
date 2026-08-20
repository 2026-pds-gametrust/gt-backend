import { Schema } from 'mongoose';
import { EConversationStatus } from '../../../../domain/listing-chat/entity/enums/EConversationStatus';
import type { IMConversation } from '../models/listing-chat-conversation.model';

export const ListingChatConversationSchema = new Schema<IMConversation>(
  {
    id: { type: String, required: true, unique: true },
    listingId: { type: String, required: true, index: true },
    buyerId: { type: String, required: true, index: true },
    sellerId: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: Object.values(EConversationStatus),
      required: true,
    },
    buyerUnreadCount: { type: Number, required: true, default: 0 },
    sellerUnreadCount: { type: Number, required: true, default: 0 },
    lastMessageAt: { type: Date },
    lastMessagePreview: { type: String },
  },
  {
    timestamps: true,
    collection: 'listing_conversations',
  },
);

ListingChatConversationSchema.index(
  { listingId: 1, buyerId: 1 },
  { unique: true },
);
ListingChatConversationSchema.index({ buyerId: 1, lastMessageAt: -1 });
ListingChatConversationSchema.index({ sellerId: 1, lastMessageAt: -1 });
