import { randomUUID } from 'crypto';
import { ListingChatServiceFactory } from '../../../../configuration/factory/listing-chat.service.factory';
import { EMessageStatus } from '../../../../domain/listing-chat/entity/enums/EMessageStatus';
import { ListingChatMessageModel } from '../../../../infraestructure/db/mongo/models/listing-chat-message.model';
import { sellerActor } from '../../../__mocks__/actor.mock';
import { seedListingChatFixture } from '../../../helpers/listing-chat-fixture';

const listingChatService = ListingChatServiceFactory.create();

async function seedMessages(conversationId: string, buyerId: string, count: number) {
  const base = Date.now() - count * 1000;
  for (let i = 0; i < count; i++) {
    await ListingChatMessageModel.create({
      id: randomUUID(),
      conversationId,
      senderId: buyerId,
      body: `msg-${i}`,
      status: EMessageStatus.VISIBLE,
      createdAt: new Date(base + i * 1000),
    });
  }
}

describe('when conversation has more than 50 messages', () => {
  it('should return two disjoint pages in chronological order', async () => {
    const { buyerId, listingId } = await seedListingChatFixture();
    const conversation = await listingChatService.openConversation(
      listingId,
      sellerActor(buyerId),
    );
    await seedMessages(conversation.id, buyerId, 55);

    const firstPage = await listingChatService.listMessages(
      conversation.id,
      sellerActor(buyerId),
      50,
    );
    expect(firstPage.items).toHaveLength(50);
    expect(firstPage.nextCursor).toBeDefined();

    const secondPage = await listingChatService.listMessages(
      conversation.id,
      sellerActor(buyerId),
      50,
      firstPage.nextCursor,
    );
    expect(secondPage.items).toHaveLength(5);

    const firstIds = new Set(firstPage.items.map((m) => m.id));
    secondPage.items.forEach((m) => {
      expect(firstIds.has(m.id)).toBe(false);
    });

    const combined = [...secondPage.items, ...firstPage.items];
    for (let i = 1; i < combined.length; i++) {
      expect(combined[i].createdAt.getTime()).toBeGreaterThanOrEqual(
        combined[i - 1].createdAt.getTime(),
      );
    }
  });
});

describe('when limit exceeds maximum', () => {
  it('should clamp to 50 messages', async () => {
    const { buyerId, listingId } = await seedListingChatFixture();
    const conversation = await listingChatService.openConversation(
      listingId,
      sellerActor(buyerId),
    );
    await seedMessages(conversation.id, buyerId, 60);

    const page = await listingChatService.listMessages(
      conversation.id,
      sellerActor(buyerId),
      100,
    );
    expect(page.items.length).toBeLessThanOrEqual(50);
  });
});
