import { requireNonEmptyString } from '../../common/types/required-string';
import { EConversationStatus } from './enums/EConversationStatus';
import { IConversation } from './interfaces/conversation.interface';

export class ConversationServiceEntity implements IConversation {
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

  constructor(conversation: IConversation) {
    this.validate(conversation);
    this.id = conversation.id;
    this.listingId = conversation.listingId.trim();
    this.buyerId = conversation.buyerId.trim();
    this.sellerId = conversation.sellerId.trim();
    this.status = conversation.status;
    this.buyerUnreadCount = conversation.buyerUnreadCount;
    this.sellerUnreadCount = conversation.sellerUnreadCount;
    this.lastMessageAt = conversation.lastMessageAt;
    this.lastMessagePreview = conversation.lastMessagePreview;
    this.createdAt = conversation.createdAt;
    this.updatedAt = conversation.updatedAt;
  }

  private validate(conversation: IConversation): void {
    requireNonEmptyString(conversation.id, 'id');
    requireNonEmptyString(conversation.listingId, 'listingId');
    requireNonEmptyString(conversation.buyerId, 'buyerId');
    requireNonEmptyString(conversation.sellerId, 'sellerId');
    if (!conversation.status) throw new Error('status is required');
    if (conversation.buyerUnreadCount < 0) {
      throw new Error('buyerUnreadCount must be >= 0');
    }
    if (conversation.sellerUnreadCount < 0) {
      throw new Error('sellerUnreadCount must be >= 0');
    }
    if (!conversation.createdAt) throw new Error('createdAt is required');
  }
}
