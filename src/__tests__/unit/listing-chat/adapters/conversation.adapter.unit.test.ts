import { Types } from 'mongoose';
import { ConversationServiceEntity } from '../../../../domain/listing-chat/entity/conversation.entity';
import { EConversationStatus } from '../../../../domain/listing-chat/entity/enums/EConversationStatus';
import {
  dbToInternal,
  internalToDb,
} from '../../../../infraestructure/repository/listing-chat/adapters/conversation.adapter';

describe('when conversation adapter round-trips', () => {
  it('should preserve fields through internalToDb and dbToInternal', () => {
    const original = new ConversationServiceEntity({
      id: 'conv-1',
      listingId: 'listing-1',
      buyerId: 'buyer-1',
      sellerId: 'seller-1',
      status: EConversationStatus.ACTIVE,
      buyerUnreadCount: 0,
      sellerUnreadCount: 2,
      lastMessageAt: new Date('2026-01-01T12:00:00.000Z'),
      lastMessagePreview: 'Olá',
      createdAt: new Date('2026-01-01T10:00:00.000Z'),
    });

    const dbShape = internalToDb(original);
    const roundTripped = dbToInternal({
      ...dbShape,
      _id: new Types.ObjectId(),
    });

    expect(roundTripped).toMatchObject({
      id: original.id,
      listingId: original.listingId,
      buyerId: original.buyerId,
      sellerId: original.sellerId,
      status: original.status,
      buyerUnreadCount: original.buyerUnreadCount,
      sellerUnreadCount: original.sellerUnreadCount,
      lastMessagePreview: original.lastMessagePreview,
    });
  });
});
