import { randomUUID } from 'crypto';
import supertest from 'supertest';
import { app } from '../../../../../jest/setup-integration-tests';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { EListingStatus } from '../../../../domain/listings/entity/enums/EListingStatus';
import { EMessageStatus } from '../../../../domain/listing-chat/entity/enums/EMessageStatus';
import {
  CONTACT_REMOVED_TOKEN,
} from '../../../../domain/listing-chat/service/contact-filter.util';
import { ListingChatMessageModel } from '../../../../infraestructure/db/mongo/models/listing-chat-message.model';
import { ListingModel } from '../../../../infraestructure/db/mongo/models/listing.model';
import { appUserBearer, adminBearer } from '../../../helpers/auth-http';
import { seedListingChatFixture } from '../../../helpers/listing-chat-fixture';

describe('when we exercise listing chat HTTP routes', () => {
  it('should open conversation, send message, list and mark read', async () => {
    const { buyerId, sellerId, listingId } = await seedListingChatFixture();

    const opened = await supertest(app.app)
      .post('/conversations')
      .set('Authorization', appUserBearer(buyerId))
      .send({ listingId });
    expect(opened.statusCode).toBe(201);
    const conversationId = opened.body.id;

    const sent = await supertest(app.app)
      .post(`/conversations/${conversationId}/messages`)
      .set('Authorization', appUserBearer(buyerId))
      .send({ body: 'Ainda disponível?' });
    expect(sent.statusCode).toBe(201);
    expect(sent.body.body).toBe('Ainda disponível?');

    const listed = await supertest(app.app)
      .get('/conversations')
      .set('Authorization', appUserBearer(sellerId));
    expect(listed.statusCode).toBe(200);
    expect(listed.body.items).toHaveLength(1);

    const history = await supertest(app.app)
      .get(`/conversations/${conversationId}/messages`)
      .set('Authorization', appUserBearer(sellerId));
    expect(history.statusCode).toBe(200);
    expect(history.body.items).toHaveLength(1);

    const read = await supertest(app.app)
      .post(`/conversations/${conversationId}/read`)
      .set('Authorization', appUserBearer(sellerId));
    expect(read.statusCode).toBe(204);
  });

  it('should return 401 without token', async () => {
    const response = await supertest(app.app)
      .get('/conversations')
      .send();
    expect(response.statusCode).toBe(401);
  });

  it('should return 403 for admin chat-reports without backoffice group', async () => {
    const { buyerId } = await seedListingChatFixture();
    const response = await supertest(app.app)
      .get('/chat-reports')
      .set('Authorization', appUserBearer(buyerId));
    expect(response.statusCode).toBe(403);
  });

  it('should allow admin to list chat reports', async () => {
    const { buyerId, listingId } = await seedListingChatFixture();
    const opened = await supertest(app.app)
      .post('/conversations')
      .set('Authorization', appUserBearer(buyerId))
      .send({ listingId });
    await supertest(app.app)
      .post(`/conversations/${opened.body.id}/reports`)
      .set('Authorization', appUserBearer(buyerId))
      .send({ reason: 'Spam detectado' });

    const reports = await supertest(app.app)
      .get('/chat-reports')
      .set('Authorization', adminBearer());
    expect(reports.statusCode).toBe(200);
    expect(reports.body.items.length).toBeGreaterThanOrEqual(1);
  });

  it('should return CHAT_CONTENT_REJECTED for contact-only message', async () => {
    const { buyerId, listingId } = await seedListingChatFixture();
    const opened = await supertest(app.app)
      .post('/conversations')
      .set('Authorization', appUserBearer(buyerId))
      .send({ listingId });

    const sent = await supertest(app.app)
      .post(`/conversations/${opened.body.id}/messages`)
      .set('Authorization', appUserBearer(buyerId))
      .send({ body: '11987654321' });
    expect(sent.statusCode).toBe(422);
    expect(sent.body.code ?? sent.body.errorCode).toBe(
      EErrorCode.CHAT_CONTENT_REJECTED,
    );
  });
});

describe('when buyer opens the same conversation twice via HTTP', () => {
  it('should return the same conversation id', async () => {
    const { buyerId, listingId } = await seedListingChatFixture();

    const first = await supertest(app.app)
      .post('/conversations')
      .set('Authorization', appUserBearer(buyerId))
      .send({ listingId });
    const second = await supertest(app.app)
      .post('/conversations')
      .set('Authorization', appUserBearer(buyerId))
      .send({ listingId });

    expect(first.statusCode).toBe(201);
    expect(second.statusCode).toBe(201);
    expect(second.body.id).toBe(first.body.id);
  });
});

describe('when seller tries to open conversation on own listing via HTTP', () => {
  it('should return 403 CHAT_NOT_ELIGIBLE', async () => {
    const { sellerId, listingId } = await seedListingChatFixture();

    const response = await supertest(app.app)
      .post('/conversations')
      .set('Authorization', appUserBearer(sellerId))
      .send({ listingId });

    expect(response.statusCode).toBe(403);
    expect(response.body.errorCode ?? response.body.code).toBe(
      EErrorCode.CHAT_NOT_ELIGIBLE,
    );
  });
});

describe('when buyer opens conversation on non-published listing via HTTP', () => {
  it('should return 403 CHAT_NOT_ELIGIBLE', async () => {
    const { buyerId, listingId } = await seedListingChatFixture();
    await ListingModel.updateOne(
      { id: listingId },
      { $set: { status: EListingStatus.DRAFT } },
    );

    const response = await supertest(app.app)
      .post('/conversations')
      .set('Authorization', appUserBearer(buyerId))
      .send({ listingId });

    expect(response.statusCode).toBe(403);
    expect(response.body.errorCode ?? response.body.code).toBe(
      EErrorCode.CHAT_NOT_ELIGIBLE,
    );
  });
});

describe('when participant requests paginated message history via HTTP', () => {
  it('should return disjoint pages with cursor', async () => {
    const { buyerId, listingId } = await seedListingChatFixture();
    const opened = await supertest(app.app)
      .post('/conversations')
      .set('Authorization', appUserBearer(buyerId))
      .send({ listingId });
    const conversationId = opened.body.id;

    const base = Date.now() - 60 * 1000;
    for (let i = 0; i < 55; i++) {
      await ListingChatMessageModel.create({
        id: randomUUID(),
        conversationId,
        senderId: buyerId,
        body: `http-msg-${i}`,
        status: EMessageStatus.VISIBLE,
        createdAt: new Date(base + i * 1000),
      });
    }

    const firstPage = await supertest(app.app)
      .get(`/conversations/${conversationId}/messages?limit=50`)
      .set('Authorization', appUserBearer(buyerId));
    expect(firstPage.statusCode).toBe(200);
    expect(firstPage.body.items).toHaveLength(50);
    expect(firstPage.body.nextCursor).toBeDefined();

    const secondPage = await supertest(app.app)
      .get(
        `/conversations/${conversationId}/messages?limit=50&before=${firstPage.body.nextCursor}`,
      )
      .set('Authorization', appUserBearer(buyerId));
    expect(secondPage.statusCode).toBe(200);
    expect(secondPage.body.items).toHaveLength(5);
  });
});

describe('when participant blocks then tries to send via HTTP', () => {
  it('should return 409 CHAT_CONVERSATION_BLOCKED', async () => {
    const { buyerId, listingId } = await seedListingChatFixture();
    const opened = await supertest(app.app)
      .post('/conversations')
      .set('Authorization', appUserBearer(buyerId))
      .send({ listingId });
    const conversationId = opened.body.id;

    const blocked = await supertest(app.app)
      .post(`/conversations/${conversationId}/block`)
      .set('Authorization', appUserBearer(buyerId));
    expect(blocked.statusCode).toBe(204);

    const sent = await supertest(app.app)
      .post(`/conversations/${conversationId}/messages`)
      .set('Authorization', appUserBearer(buyerId))
      .send({ body: 'depois do block' });
    expect(sent.statusCode).toBe(409);
    expect(sent.body.errorCode ?? sent.body.code).toBe(
      EErrorCode.CHAT_CONVERSATION_BLOCKED,
    );
  });
});

describe('when participant reports via HTTP', () => {
  it('should accept conversation and message reports', async () => {
    const { buyerId, listingId } = await seedListingChatFixture();
    const opened = await supertest(app.app)
      .post('/conversations')
      .set('Authorization', appUserBearer(buyerId))
      .send({ listingId });
    const conversationId = opened.body.id;

    const sent = await supertest(app.app)
      .post(`/conversations/${conversationId}/messages`)
      .set('Authorization', appUserBearer(buyerId))
      .send({ body: 'conteúdo reportável' });
    const messageId = sent.body.id;

    const conversationReport = await supertest(app.app)
      .post(`/conversations/${conversationId}/reports`)
      .set('Authorization', appUserBearer(buyerId))
      .send({ reason: 'Assédio na negociação' });
    expect(conversationReport.statusCode).toBe(201);

    const messageReport = await supertest(app.app)
      .post(`/conversations/${conversationId}/messages/${messageId}/reports`)
      .set('Authorization', appUserBearer(buyerId))
      .send({ reason: 'Conteúdo inadequado' });
    expect(messageReport.statusCode).toBe(201);
  });
});

describe('when participant sends message with embedded contact via HTTP', () => {
  it('should return masked body without exposing contact in clear', async () => {
    const { buyerId, listingId } = await seedListingChatFixture();
    const opened = await supertest(app.app)
      .post('/conversations')
      .set('Authorization', appUserBearer(buyerId))
      .send({ listingId });

    const sent = await supertest(app.app)
      .post(`/conversations/${opened.body.id}/messages`)
      .set('Authorization', appUserBearer(buyerId))
      .send({ body: 'Me liga 11999998888 amanhã' });

    expect(sent.statusCode).toBe(201);
    expect(sent.body.body).toContain(CONTACT_REMOVED_TOKEN);
    expect(sent.body.body).not.toContain('11999998888');
  });
});
