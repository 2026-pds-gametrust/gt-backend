import { Types } from 'mongoose';
import { ListingChatServiceFactory } from '../../../../configuration/factory/listing-chat.service.factory';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { sellerActor } from '../../../__mocks__/actor.mock';
import { seedListingChatFixture } from '../../../helpers/listing-chat-fixture';

const listingChatService = ListingChatServiceFactory.create();

describe('when non-participant accesses conversation', () => {
  it('should reject getConversation with RESOURCE_NOT_FOUND', async () => {
    const { buyerId, listingId } = await seedListingChatFixture();
    const conversation = await listingChatService.openConversation(
      listingId,
      sellerActor(buyerId),
    );
    const outsiderId = new Types.ObjectId().toHexString();

    await expect(
      listingChatService.getConversation(
        conversation.id,
        sellerActor(outsiderId),
      ),
    ).rejects.toMatchObject({
      status: 404,
      errorCode: EErrorCode.RESOURCE_NOT_FOUND,
    });
  });

  it('should reject sendMessage with RESOURCE_NOT_FOUND', async () => {
    const { buyerId, listingId } = await seedListingChatFixture();
    const conversation = await listingChatService.openConversation(
      listingId,
      sellerActor(buyerId),
    );
    const outsiderId = new Types.ObjectId().toHexString();

    await expect(
      listingChatService.sendMessage(
        conversation.id,
        'hack',
        sellerActor(outsiderId),
      ),
    ).rejects.toMatchObject({
      status: 404,
      errorCode: EErrorCode.RESOURCE_NOT_FOUND,
    });
  });

  it('should reject listMessages with RESOURCE_NOT_FOUND', async () => {
    const { buyerId, listingId } = await seedListingChatFixture();
    const conversation = await listingChatService.openConversation(
      listingId,
      sellerActor(buyerId),
    );
    const outsiderId = new Types.ObjectId().toHexString();

    await expect(
      listingChatService.listMessages(
        conversation.id,
        sellerActor(outsiderId),
      ),
    ).rejects.toMatchObject({
      status: 404,
      errorCode: EErrorCode.RESOURCE_NOT_FOUND,
    });
  });
});

describe('when actor is missing', () => {
  it('should reject with FIELD_INVALID', async () => {
    const { buyerId, listingId } = await seedListingChatFixture();
    const conversation = await listingChatService.openConversation(
      listingId,
      sellerActor(buyerId),
    );

    await expect(
      listingChatService.getConversation(conversation.id, {
        actorId: '',
        groups: [],
      }),
    ).rejects.toMatchObject({
      status: 403,
      errorCode: EErrorCode.FIELD_INVALID,
    });
  });
});
