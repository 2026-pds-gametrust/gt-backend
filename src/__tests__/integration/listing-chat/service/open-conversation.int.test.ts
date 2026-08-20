import { randomUUID } from 'crypto';
import { ListingChatServiceFactory } from '../../../../configuration/factory/listing-chat.service.factory';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { EConversationStatus } from '../../../../domain/listing-chat/entity/enums/EConversationStatus';
import { EListingStatus } from '../../../../domain/listings/entity/enums/EListingStatus';
import { ListingChatConversationModel } from '../../../../infraestructure/db/mongo/models/listing-chat-conversation.model';
import { ListingModel } from '../../../../infraestructure/db/mongo/models/listing.model';
import { sellerActor } from '../../../__mocks__/actor.mock';
import { seedListingChatFixture } from '../../../helpers/listing-chat-fixture';

const listingChatService = ListingChatServiceFactory.create();

describe('when buyer opens conversation on published listing', () => {
  it('should return ACTIVE conversation with 201 semantics', async () => {
    const { buyerId, sellerId, listingId } = await seedListingChatFixture();

    const conversation = await listingChatService.openConversation(
      listingId,
      sellerActor(buyerId),
    );

    expect(conversation).toMatchObject({
      listingId,
      buyerId,
      sellerId,
      status: EConversationStatus.ACTIVE,
      buyerUnreadCount: 0,
      sellerUnreadCount: 0,
    });
  });
});

describe('when buyer opens conversation twice for same listing', () => {
  it('should return the same conversation id', async () => {
    const { buyerId, listingId } = await seedListingChatFixture();

    const first = await listingChatService.openConversation(
      listingId,
      sellerActor(buyerId),
    );
    const second = await listingChatService.openConversation(
      listingId,
      sellerActor(buyerId),
    );

    expect(second.id).toBe(first.id);
    const count = await ListingChatConversationModel.countDocuments({
      listingId,
      buyerId,
    });
    expect(count).toBe(1);
  });
});

describe('when seller tries to open conversation on own listing', () => {
  it('should reject with CHAT_NOT_ELIGIBLE', async () => {
    const { sellerId, listingId } = await seedListingChatFixture();

    await expect(
      listingChatService.openConversation(listingId, sellerActor(sellerId)),
    ).rejects.toMatchObject({
      status: 403,
      errorCode: EErrorCode.CHAT_NOT_ELIGIBLE,
    });
  });
});

describe('when buyer opens conversation on non-published listing', () => {
  it('should reject with CHAT_NOT_ELIGIBLE', async () => {
    const { buyerId, listingId } = await seedListingChatFixture();
    await ListingModel.updateOne(
      { id: listingId },
      { $set: { status: EListingStatus.DRAFT } },
    );

    await expect(
      listingChatService.openConversation(listingId, sellerActor(buyerId)),
    ).rejects.toMatchObject({
      status: 403,
      errorCode: EErrorCode.CHAT_NOT_ELIGIBLE,
    });
  });
});

describe('when anonymous actor opens conversation', () => {
  it('should reject with FIELD_INVALID for missing actor', async () => {
    const { listingId } = await seedListingChatFixture();

    await expect(
      listingChatService.openConversation(listingId, {
        actorId: '',
        groups: [],
      }),
    ).rejects.toMatchObject({
      status: 403,
      errorCode: EErrorCode.FIELD_INVALID,
    });
  });
});

describe('when duplicate conversation is inserted for same listing and buyer', () => {
  it('should reject with duplicate key error', async () => {
    const { buyerId, sellerId, listingId } = await seedListingChatFixture();
    await listingChatService.openConversation(listingId, sellerActor(buyerId));

    await expect(
      ListingChatConversationModel.create({
        id: randomUUID(),
        listingId,
        buyerId,
        sellerId,
        status: EConversationStatus.ACTIVE,
        buyerUnreadCount: 0,
        sellerUnreadCount: 0,
      }),
    ).rejects.toMatchObject({ code: 11000 });
  });
});

describe('when buyer opens conversation concurrently for same listing', () => {
  it('should resolve to a single conversation id', async () => {
    const { buyerId, listingId } = await seedListingChatFixture();

    const results = await Promise.all([
      listingChatService.openConversation(listingId, sellerActor(buyerId)),
      listingChatService.openConversation(listingId, sellerActor(buyerId)),
      listingChatService.openConversation(listingId, sellerActor(buyerId)),
    ]);

    const ids = new Set(results.map((result) => result.id));
    expect(ids.size).toBe(1);

    const count = await ListingChatConversationModel.countDocuments({
      listingId,
      buyerId,
    });
    expect(count).toBe(1);
  });
});
