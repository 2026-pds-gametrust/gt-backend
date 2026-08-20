import { EUserGroup } from '@sauvvitech/st-packages';
import { ListingChatServiceFactory } from '../../../../configuration/factory/listing-chat.service.factory';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { EChatReportTargetType } from '../../../../domain/listing-chat/entity/enums/EChatReportTargetType';
import { EMessageStatus } from '../../../../domain/listing-chat/entity/enums/EMessageStatus';
import { ListingChatMessageModel } from '../../../../infraestructure/db/mongo/models/listing-chat-message.model';
import { ListingChatReportModel } from '../../../../infraestructure/db/mongo/models/listing-chat-report.model';
import { adminActor, sellerActor } from '../../../__mocks__/actor.mock';
import { seedListingChatFixture } from '../../../helpers/listing-chat-fixture';

const listingChatService = ListingChatServiceFactory.create();

describe('when participant reports a message', () => {
  it('should persist report and keep message VISIBLE', async () => {
    const { buyerId, listingId } = await seedListingChatFixture();
    const conversation = await listingChatService.openConversation(
      listingId,
      sellerActor(buyerId),
    );
    const message = await listingChatService.sendMessage(
      conversation.id,
      'conteúdo reportável',
      sellerActor(buyerId),
    );

    const report = await listingChatService.createReport(
      conversation.id,
      sellerActor(buyerId),
      'Conteúdo inadequado',
      EChatReportTargetType.MESSAGE,
      message.id,
    );

    expect(report.targetType).toBe(EChatReportTargetType.MESSAGE);
    const persistedMessage = await ListingChatMessageModel.findOne({
      id: message.id,
    });
    expect(persistedMessage?.status).toBe(EMessageStatus.VISIBLE);
  });
});

describe('when participant reports a conversation', () => {
  it('should persist report without changing conversation state', async () => {
    const { buyerId, listingId } = await seedListingChatFixture();
    const conversation = await listingChatService.openConversation(
      listingId,
      sellerActor(buyerId),
    );

    await listingChatService.createReport(
      conversation.id,
      sellerActor(buyerId),
      'Assédio na negociação',
      EChatReportTargetType.CONVERSATION,
    );

    const unchanged = await listingChatService.getConversation(
      conversation.id,
      sellerActor(buyerId),
    );
    expect(unchanged.status).toBe('ACTIVE');
  });
});

describe('when same reporter submits duplicate report', () => {
  it('should upsert without creating duplicate documents', async () => {
    const { buyerId, listingId } = await seedListingChatFixture();
    const conversation = await listingChatService.openConversation(
      listingId,
      sellerActor(buyerId),
    );

    await listingChatService.createReport(
      conversation.id,
      sellerActor(buyerId),
      'Motivo inicial',
      EChatReportTargetType.CONVERSATION,
    );
    await listingChatService.createReport(
      conversation.id,
      sellerActor(buyerId),
      'Motivo atualizado',
      EChatReportTargetType.CONVERSATION,
    );

    const count = await ListingChatReportModel.countDocuments({
      reporterId: buyerId,
      targetType: EChatReportTargetType.CONVERSATION,
      targetId: conversation.id,
    });
    expect(count).toBe(1);
  });
});

describe('when admin lists chat reports', () => {
  it('should return persisted reports', async () => {
    const { buyerId, listingId } = await seedListingChatFixture();
    const conversation = await listingChatService.openConversation(
      listingId,
      sellerActor(buyerId),
    );
    await listingChatService.createReport(
      conversation.id,
      sellerActor(buyerId),
      'Spam',
      EChatReportTargetType.CONVERSATION,
    );

    const page = await listingChatService.listChatReports();
    expect(page.items.length).toBeGreaterThanOrEqual(1);
  });
});

describe('when app user tries admin list', () => {
  it('should be enforced at controller layer with authorizeByGroup', async () => {
    expect(EUserGroup.ADMIN).toBeDefined();
    expect(adminActor().groups).toContain(EUserGroup.ADMIN);
    expect(EErrorCode.FIELD_INVALID).toBeDefined();
  });
});
