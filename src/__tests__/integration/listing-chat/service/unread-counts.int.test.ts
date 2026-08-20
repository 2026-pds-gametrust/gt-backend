import { ListingChatServiceFactory } from '../../../../configuration/factory/listing-chat.service.factory';
import { ListingChatConversationModel } from '../../../../infraestructure/db/mongo/models/listing-chat-conversation.model';
import { sellerActor } from '../../../__mocks__/actor.mock';
import { seedListingChatFixture } from '../../../helpers/listing-chat-fixture';

const listingChatService = ListingChatServiceFactory.create();

describe('when buyer sends message to seller', () => {
  it('should increment seller unread and not buyer unread', async () => {
    const { buyerId, listingId } = await seedListingChatFixture();
    const conversation = await listingChatService.openConversation(
      listingId,
      sellerActor(buyerId),
    );

    await listingChatService.sendMessage(
      conversation.id,
      'Olá!',
      sellerActor(buyerId),
    );

    const updated = await ListingChatConversationModel.findOne({
      id: conversation.id,
    });
    expect(updated?.sellerUnreadCount).toBeGreaterThanOrEqual(1);
    expect(updated?.buyerUnreadCount).toBe(0);
  });
});

describe('when seller reads messages via listMessages', () => {
  it('should zero seller unread count', async () => {
    const { buyerId, sellerId, listingId } = await seedListingChatFixture();
    const conversation = await listingChatService.openConversation(
      listingId,
      sellerActor(buyerId),
    );

    await listingChatService.sendMessage(
      conversation.id,
      'Olá!',
      sellerActor(buyerId),
    );

    await listingChatService.listMessages(
      conversation.id,
      sellerActor(sellerId),
    );

    const updated = await ListingChatConversationModel.findOne({
      id: conversation.id,
    });
    expect(updated?.sellerUnreadCount).toBe(0);
  });
});

describe('when participant marks conversation read', () => {
  it('should zero unread for that participant', async () => {
    const { buyerId, sellerId, listingId } = await seedListingChatFixture();
    const conversation = await listingChatService.openConversation(
      listingId,
      sellerActor(buyerId),
    );

    await listingChatService.sendMessage(
      conversation.id,
      'Resposta',
      sellerActor(sellerId),
    );

    await listingChatService.markConversationRead(
      conversation.id,
      sellerActor(buyerId),
    );

    const updated = await ListingChatConversationModel.findOne({
      id: conversation.id,
    });
    expect(updated?.buyerUnreadCount).toBe(0);
  });
});
