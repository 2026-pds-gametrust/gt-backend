import { IConversation } from '../../../../domain/listing-chat/entity/interfaces/conversation.interface';
import { IMConversation } from '../../../db/mongo/models/listing-chat-conversation.model';

export function dbToInternal(doc: IMConversation): IConversation {
  return {
    id: doc.id,
    listingId: doc.listingId,
    buyerId: doc.buyerId,
    sellerId: doc.sellerId,
    status: doc.status,
    buyerUnreadCount: doc.buyerUnreadCount,
    sellerUnreadCount: doc.sellerUnreadCount,
    lastMessageAt: doc.lastMessageAt,
    lastMessagePreview: doc.lastMessagePreview,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export function internalToDb(
  conversation: IConversation,
): Omit<IMConversation, '_id'> {
  return {
    id: conversation.id,
    listingId: conversation.listingId,
    buyerId: conversation.buyerId,
    sellerId: conversation.sellerId,
    status: conversation.status,
    buyerUnreadCount: conversation.buyerUnreadCount,
    sellerUnreadCount: conversation.sellerUnreadCount,
    lastMessageAt: conversation.lastMessageAt,
    lastMessagePreview: conversation.lastMessagePreview,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  };
}
