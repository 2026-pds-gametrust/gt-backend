import { ListingChatServiceFactory } from '../../../../configuration/factory/listing-chat.service.factory';
import { EConversationStatus } from '../../../../domain/listing-chat/entity/enums/EConversationStatus';
import { sellerActor } from '../../../__mocks__/actor.mock';
import { seedListingChatFixture } from '../../../helpers/listing-chat-fixture';

const listingChatService = ListingChatServiceFactory.create();

describe('when participant lists conversations', () => {
  it('should include listing context, other participant and unread counts', async () => {
    const { buyerId, sellerId, listingId } = await seedListingChatFixture();
    const conversation = await listingChatService.openConversation(
      listingId,
      sellerActor(buyerId),
    );

    await listingChatService.sendMessage(
      conversation.id,
      'Tem nota fiscal?',
      sellerActor(buyerId),
    );

    const page = await listingChatService.listConversations(
      sellerActor(sellerId),
    );

    expect(page.items).toHaveLength(1);
    expect(page.items[0]).toMatchObject({
      id: conversation.id,
      listing: { id: listingId, title: 'GPU RTX 4070' },
      otherParticipant: { userId: buyerId, displayName: 'Comprador' },
      sellerUnreadCount: 1,
      status: EConversationStatus.ACTIVE,
    });
    expect(page.items[0].lastMessagePreview).toContain('nota');
  });
});

describe('when third user lists conversations', () => {
  it('should not include conversations they do not participate in', async () => {
    const { buyerId, listingId } = await seedListingChatFixture();
    await listingChatService.openConversation(
      listingId,
      sellerActor(buyerId),
    );

    const page = await listingChatService.listConversations(
      sellerActor('third-party-user'),
    );
    expect(page.items).toHaveLength(0);
  });
});
