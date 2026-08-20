import supertest from 'supertest';
import { app } from '../../../../../jest/setup-integration-tests';
import { CHAT_SEND_RATE_LIMIT_PER_MINUTE } from '../../../../configuration/env-constants/listing-chat.env';
import { appUserBearer } from '../../../helpers/auth-http';
import { seedListingChatFixture } from '../../../helpers/listing-chat-fixture';

function rateLimitRemaining(headers: Record<string, unknown>): string | undefined {
  return (
    (headers['ratelimit-remaining'] as string | undefined) ??
    (headers['x-ratelimit-remaining'] as string | undefined)
  );
}

describe('when participant exceeds send message rate limit', () => {
  jest.setTimeout(60000);

  it('should expose rate-limit headers and block further sends', async () => {
    const { buyerId, listingId } = await seedListingChatFixture();
    const opened = await supertest(app.app)
      .post('/conversations')
      .set('Authorization', appUserBearer(buyerId))
      .send({ listingId });
    const conversationId = opened.body.id;

    let lastHeaders: Record<string, unknown> = {};
    for (let i = 0; i < CHAT_SEND_RATE_LIMIT_PER_MINUTE; i++) {
      const response = await supertest(app.app)
        .post(`/conversations/${conversationId}/messages`)
        .set('Authorization', appUserBearer(buyerId))
        .send({ body: `msg-${i}` });
      expect(response.statusCode).toBe(201);
      lastHeaders = response.headers;
    }

    expect(rateLimitRemaining(lastHeaders)).toBe('0');

    const throttled = await supertest(app.app)
      .post(`/conversations/${conversationId}/messages`)
      .set('Authorization', appUserBearer(buyerId))
      .send({ body: 'msg-throttled' });

    expect(throttled.statusCode).not.toBe(201);
    expect(throttled.statusCode).toBeGreaterThanOrEqual(429);
  });
});
