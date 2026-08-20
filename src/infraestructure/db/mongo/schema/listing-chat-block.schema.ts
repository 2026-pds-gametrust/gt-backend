import { Schema } from 'mongoose';
import type { IMChatBlock } from '../models/listing-chat-block.model';

export const ListingChatBlockSchema = new Schema<IMChatBlock>(
  {
    id: { type: String, required: true, unique: true },
    blockerId: { type: String, required: true, index: true },
    blockedUserId: { type: String, required: true, index: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'listing_chat_blocks',
  },
);

ListingChatBlockSchema.index(
  { blockerId: 1, blockedUserId: 1 },
  { unique: true },
);
