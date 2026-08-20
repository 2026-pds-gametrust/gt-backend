import { Schema } from 'mongoose';
import { EMessageStatus } from '../../../../domain/listing-chat/entity/enums/EMessageStatus';
import type { IMMessage } from '../models/listing-chat-message.model';

export const ListingChatMessageSchema = new Schema<IMMessage>(
  {
    id: { type: String, required: true, unique: true },
    conversationId: { type: String, required: true, index: true },
    senderId: { type: String, required: true },
    body: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(EMessageStatus),
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'listing_chat_messages',
  },
);

ListingChatMessageSchema.index({
  conversationId: 1,
  createdAt: 1,
  id: 1,
});
