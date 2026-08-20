import { randomUUID } from 'crypto';
import { Types } from 'mongoose';
import supertest from 'supertest';
import { app } from '../../../../../jest/setup-integration-tests';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { EMessageStatus } from '../../../../domain/listing-chat/entity/enums/EMessageStatus';
import { ListingChatMessageModel } from '../../../../infraestructure/db/mongo/models/listing-chat-message.model';
import { appUserBearer } from '../../../helpers/auth-http';
import { seedListingChatFixture } from '../../../helpers/listing-chat-fixture';

async function seedConversationWithMessage() {
  const fixture = await seedListingChatFixture();
  const opened = await supertest(app.app)
    .post('/conversations')
    .set('Authorization', appUserBearer(fixture.buyerId))
    .send({ listingId: fixture.listingId });
  const conversationId = opened.body.id;

  await ListingChatMessageModel.create({
    id: randomUUID(),
    conversationId,
    senderId: fixture.buyerId,
    body: 'mensagem-secreta-bola',
    status: EMessageStatus.VISIBLE,
    createdAt: new Date(),
  });

  return { ...fixture, conversationId };
}

describe('when non-participant accesses conversation via HTTP', () => {
  it('should return 404 without exposing message bodies on GET', async () => {
    const { conversationId } = await seedConversationWithMessage();
    const outsiderId = new Types.ObjectId().toHexString();

    const conversation = await supertest(app.app)
      .get(`/conversations/${conversationId}`)
      .set('Authorization', appUserBearer(outsiderId));
    expect(conversation.statusCode).toBe(404);
    expect(JSON.stringify(conversation.body)).not.toContain('mensagem-secreta-bola');

    const messages = await supertest(app.app)
      .get(`/conversations/${conversationId}/messages`)
      .set('Authorization', appUserBearer(outsiderId));
    expect(messages.statusCode).toBe(404);
    expect(JSON.stringify(messages.body)).not.toContain('mensagem-secreta-bola');
    expect(messages.body.items).toBeUndefined();
  });

  it('should return 404 for POST message without creating data', async () => {
    const { conversationId } = await seedConversationWithMessage();
    const outsiderId = new Types.ObjectId().toHexString();
    const before = await ListingChatMessageModel.countDocuments({});

    const response = await supertest(app.app)
      .post(`/conversations/${conversationId}/messages`)
      .set('Authorization', appUserBearer(outsiderId))
      .send({ body: 'tentativa de invasão' });

    expect(response.statusCode).toBe(404);
    expect(response.body.errorCode ?? response.body.code).toBe(
      EErrorCode.RESOURCE_NOT_FOUND,
    );
    const after = await ListingChatMessageModel.countDocuments({});
    expect(after).toBe(before);
  });

  it('should return 404 for block and report actions', async () => {
    const { conversationId } = await seedConversationWithMessage();
    const outsiderId = new Types.ObjectId().toHexString();

    const block = await supertest(app.app)
      .post(`/conversations/${conversationId}/block`)
      .set('Authorization', appUserBearer(outsiderId));
    expect(block.statusCode).toBe(404);

    const report = await supertest(app.app)
      .post(`/conversations/${conversationId}/reports`)
      .set('Authorization', appUserBearer(outsiderId))
      .send({ reason: 'abuso' });
    expect(report.statusCode).toBe(404);
  });
});

describe('when BOLA error responses are returned', () => {
  it('should omit stack traces Mongo documents and sensitive payloads', async () => {
    const { conversationId } = await seedConversationWithMessage();
    const outsiderId = new Types.ObjectId().toHexString();

    const response = await supertest(app.app)
      .get(`/conversations/${conversationId}/messages`)
      .set('Authorization', appUserBearer(outsiderId));

    const bodyText = JSON.stringify(response.body);
    expect(bodyText).not.toContain('stack');
    expect(bodyText).not.toContain('mensagem-secreta-bola');
    expect(bodyText).not.toMatch(/@/);
    expect(bodyText).not.toContain('Mongo');
  });
});

describe('when anonymous caller hits ListingChat routes', () => {
  it('should return 401 AUTH_UNAUTHORIZED on participant endpoints', async () => {
    const { listingId } = await seedListingChatFixture();
    const conversationId = randomUUID();
    const messageId = randomUUID();

    const routes = [
      { method: 'post' as const, path: '/conversations', body: { listingId } },
      { method: 'get' as const, path: '/conversations' },
      { method: 'get' as const, path: `/conversations/${conversationId}` },
      {
        method: 'get' as const,
        path: `/conversations/${conversationId}/messages`,
      },
      {
        method: 'post' as const,
        path: `/conversations/${conversationId}/messages`,
        body: { body: 'olá' },
      },
      {
        method: 'post' as const,
        path: `/conversations/${conversationId}/read`,
      },
      {
        method: 'post' as const,
        path: `/conversations/${conversationId}/block`,
      },
      {
        method: 'post' as const,
        path: `/conversations/${conversationId}/reports`,
        body: { reason: 'spam' },
      },
      {
        method: 'post' as const,
        path: `/conversations/${conversationId}/messages/${messageId}/reports`,
        body: { reason: 'spam' },
      },
    ];

    for (const route of routes) {
      const agent = supertest(app.app)[route.method](route.path);
      const response = route.body ? await agent.send(route.body) : await agent.send();
      expect(response.statusCode).toBe(401);
      expect(response.body.errorCode ?? response.body.code).toBe(
        EErrorCode.AUTH_UNAUTHORIZED,
      );
    }
  });

  it('should not allow anonymous access to admin chat-reports', async () => {
    const response = await supertest(app.app).get('/chat-reports').send();
    expect(response.statusCode).not.toBe(200);
    expect(response.body.items).toBeUndefined();
  });
});
