import { EConversationStatus } from '../enums/EConversationStatus';

export interface IConversation {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  status: EConversationStatus;
  buyerUnreadCount: number;
  sellerUnreadCount: number;
  lastMessageAt?: Date;
  lastMessagePreview?: string;
  createdAt: Date;
  updatedAt?: Date;
}
