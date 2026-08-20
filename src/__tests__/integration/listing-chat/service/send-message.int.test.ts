import { ListingChatServiceFactory } from '../../../../configuration/factory/listing-chat.service.factory';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { EMessageStatus } from '../../../../domain/listing-chat/entity/enums/EMessageStatus';
import {
  CONTACT_REMOVED_TOKEN,
} from '../../../../domain/listing-chat/service/contact-filter.util';
import { EListingStatus } from '../../../../domain/listings/entity/enums/EListingStatus';
import { ListingChatMessageModel } from '../../../../infraestructure/db/mongo/models/listing-chat-message.model';
import { ListingModel } from '../../../../infraestructure/db/mongo/models/listing.model';
import { sellerActor } from '../../../__mocks__/actor.mock';
import { seedListingChatFixture } from '../../../helpers/listing-chat-fixture';

const listingChatService = ListingChatServiceFactory.create();

async function openConversation(buyerId: string, listingId: string) {
  return listingChatService.openConversation(listingId, sellerActor(buyerId));
}

describe('when participant sends valid text message', () => {
  it('should persist VISIBLE message with masked body when needed', async () => {
    const { buyerId, listingId } = await seedListingChatFixture();
    const conversation = await openConversation(buyerId, listingId);

    const message = await listingChatService.sendMessage(
      conversation.id,
      'Ainda disponível?',
      sellerActor(buyerId),
    );

    expect(message).toMatchObject({
      conversationId: conversation.id,
      senderId: buyerId,
      body: 'Ainda disponível?',
      status: EMessageStatus.VISIBLE,
    });

    const persisted = await ListingChatMessageModel.findOne({ id: message.id });
    expect(persisted).not.toBeNull();
  });
});

describe('when participant sends empty message body', () => {
  it('should reject without creating message', async () => {
    const { buyerId, listingId } = await seedListingChatFixture();
    const conversation = await openConversation(buyerId, listingId);
    const before = await ListingChatMessageModel.countDocuments({});

    await expect(
      listingChatService.sendMessage(
        conversation.id,
        '   ',
        sellerActor(buyerId),
      ),
    ).rejects.toMatchObject({
      status: 422,
      errorCode: EErrorCode.FIELD_INVALID,
    });

    const after = await ListingChatMessageModel.countDocuments({});
    expect(after).toBe(before);
  });
});

describe('when participant sends message exceeding max length', () => {
  it('should reject with FIELD_MAX_LENGTH', async () => {
    const { buyerId, listingId } = await seedListingChatFixture();
    const conversation = await openConversation(buyerId, listingId);

    await expect(
      listingChatService.sendMessage(
        conversation.id,
        'x'.repeat(2001),
        sellerActor(buyerId),
      ),
    ).rejects.toMatchObject({
      status: 422,
      errorCode: EErrorCode.FIELD_MAX_LENGTH,
    });
  });
});

describe('when participant sends contact-only message', () => {
  it('should reject with CHAT_CONTENT_REJECTED', async () => {
    const { buyerId, listingId } = await seedListingChatFixture();
    const conversation = await openConversation(buyerId, listingId);

    await expect(
      listingChatService.sendMessage(
        conversation.id,
        '11987654321',
        sellerActor(buyerId),
      ),
    ).rejects.toMatchObject({
      status: 422,
      errorCode: EErrorCode.CHAT_CONTENT_REJECTED,
    });
  });
});

describe('when seller replies to buyer', () => {
  it('should allow seller to send message in existing conversation', async () => {
    const { buyerId, sellerId, listingId } = await seedListingChatFixture();
    const conversation = await openConversation(buyerId, listingId);

    const message = await listingChatService.sendMessage(
      conversation.id,
      'Sim, ainda está!',
      sellerActor(sellerId),
    );

    expect(message.senderId).toBe(sellerId);
  });
});

describe('when participant sends message with embedded contact', () => {
  it('should persist VISIBLE message with masked contact', async () => {
    const { buyerId, listingId } = await seedListingChatFixture();
    const conversation = await openConversation(buyerId, listingId);

    const message = await listingChatService.sendMessage(
      conversation.id,
      'Me liga 11999998888 amanhã',
      sellerActor(buyerId),
    );

    expect(message.status).toBe(EMessageStatus.VISIBLE);
    expect(message.body).toContain(CONTACT_REMOVED_TOKEN);
    expect(message.body).not.toContain('11999998888');
    expect(message.body).toContain('Me liga');
  });
});

describe('when listing is no longer published but conversation exists', () => {
  it('should still allow sending messages', async () => {
    const { buyerId, listingId } = await seedListingChatFixture();
    const conversation = await openConversation(buyerId, listingId);

    await ListingModel.updateOne(
      { id: listingId },
      { $set: { status: EListingStatus.PAUSED } },
    );

    const message = await listingChatService.sendMessage(
      conversation.id,
      'Ainda tenho interesse',
      sellerActor(buyerId),
    );

    expect(message.status).toBe(EMessageStatus.VISIBLE);
    expect(message.body).toBe('Ainda tenho interesse');
  });
});
