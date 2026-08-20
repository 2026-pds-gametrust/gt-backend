import { Types } from 'mongoose';
import { ListingChatServiceFactory } from '../../../../configuration/factory/listing-chat.service.factory';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { EConversationStatus } from '../../../../domain/listing-chat/entity/enums/EConversationStatus';
import { EListingStatus } from '../../../../domain/listings/entity/enums/EListingStatus';
import { ListingChatConversationModel } from '../../../../infraestructure/db/mongo/models/listing-chat-conversation.model';
import { ListingModel } from '../../../../infraestructure/db/mongo/models/listing.model';
import { sellerActor } from '../../../__mocks__/actor.mock';
import { validListingMock } from '../../../__mocks__/listing.mock';
import { seedListingChatFixture } from '../../../helpers/listing-chat-fixture';

const listingChatService = ListingChatServiceFactory.create();

describe('when participant blocks the other user', () => {
  it('should set conversation BLOCKED and reject new messages', async () => {
    const { buyerId, sellerId, listingId } = await seedListingChatFixture();
    const conversation = await listingChatService.openConversation(
      listingId,
      sellerActor(buyerId),
    );

    await listingChatService.blockParticipant(
      conversation.id,
      sellerActor(buyerId),
    );

    const updated = await ListingChatConversationModel.findOne({
      id: conversation.id,
    });
    expect(updated?.status).toBe(EConversationStatus.BLOCKED);

    await expect(
      listingChatService.sendMessage(
        conversation.id,
        'ainda quero',
        sellerActor(buyerId),
      ),
    ).rejects.toMatchObject({
      status: 409,
      errorCode: EErrorCode.CHAT_CONVERSATION_BLOCKED,
    });

    await expect(
      listingChatService.sendMessage(
        conversation.id,
        'resposta',
        sellerActor(sellerId),
      ),
    ).rejects.toMatchObject({
      status: 409,
      errorCode: EErrorCode.CHAT_CONVERSATION_BLOCKED,
    });
  });

  it('should still allow reading previous history', async () => {
    const { buyerId, sellerId, listingId } = await seedListingChatFixture();
    const conversation = await listingChatService.openConversation(
      listingId,
      sellerActor(buyerId),
    );

    await listingChatService.sendMessage(
      conversation.id,
      'antes do block',
      sellerActor(buyerId),
    );

    await listingChatService.blockParticipant(
      conversation.id,
      sellerActor(buyerId),
    );

    const page = await listingChatService.listMessages(
      conversation.id,
      sellerActor(sellerId),
    );
    expect(page.items).toHaveLength(1);
    expect(page.items[0].body).toBe('antes do block');
  });
});

describe('when block applies across multiple listings between same pair', () => {
  it('should block the second conversation as well', async () => {
    const { buyerId, sellerId, listingId } = await seedListingChatFixture();
    const listing2Id = new Types.ObjectId().toHexString();
    await ListingModel.create(
      validListingMock({
        id: listing2Id,
        sellerId,
        status: EListingStatus.PUBLISHED,
      }),
    );

    const conv1 = await listingChatService.openConversation(
      listingId,
      sellerActor(buyerId),
    );
    const conv2 = await listingChatService.openConversation(
      listing2Id,
      sellerActor(buyerId),
    );

    await listingChatService.blockParticipant(
      conv1.id,
      sellerActor(buyerId),
    );

    const second = await ListingChatConversationModel.findOne({ id: conv2.id });
    expect(second?.status).toBe(EConversationStatus.BLOCKED);
  });
});
