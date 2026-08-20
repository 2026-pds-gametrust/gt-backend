import { Logger } from 'traceability';
import { ListingChatServiceFactory } from '../../../../configuration/factory/listing-chat.service.factory';
import { EChatReportTargetType } from '../../../../domain/listing-chat/entity/enums/EChatReportTargetType';
import { sellerActor } from '../../../__mocks__/actor.mock';
import { seedListingChatFixture } from '../../../helpers/listing-chat-fixture';

const listingChatService = ListingChatServiceFactory.create();

describe('when participant sends a message with contact', () => {
  it('should log only opaque ids without message body or PII', async () => {
    const infoSpy = jest.spyOn(Logger, 'info').mockImplementation(() => Logger);
    const { buyerId, listingId } = await seedListingChatFixture();
    const conversation = await listingChatService.openConversation(
      listingId,
      sellerActor(buyerId),
    );

    await listingChatService.sendMessage(
      conversation.id,
      'Me liga 11999998888 amanhã',
      sellerActor(buyerId),
    );

    const logged = infoSpy.mock.calls.map((args) => JSON.stringify(args)).join('\n');
    expect(logged).toContain('listing_chat.message.sent');
    expect(logged).not.toContain('11999998888');
    expect(logged).not.toContain('Me liga');
    expect(logged).not.toMatch(/@/);
    infoSpy.mockRestore();
  });
});

describe('when participant creates a chat report', () => {
  it('should log report metadata without reason body or PII', async () => {
    const infoSpy = jest.spyOn(Logger, 'info').mockImplementation(() => Logger);
    const { buyerId, listingId } = await seedListingChatFixture();
    const conversation = await listingChatService.openConversation(
      listingId,
      sellerActor(buyerId),
    );

    await listingChatService.createReport(
      conversation.id,
      sellerActor(buyerId),
      'Motivo com email test@example.com e telefone 11999998888',
      EChatReportTargetType.CONVERSATION,
    );

    const logged = infoSpy.mock.calls.map((args) => JSON.stringify(args)).join('\n');
    expect(logged).toContain('listing_chat.report.created');
    expect(logged).not.toContain('test@example.com');
    expect(logged).not.toContain('11999998888');
    expect(logged).not.toContain('Motivo com email');
    infoSpy.mockRestore();
  });
});
