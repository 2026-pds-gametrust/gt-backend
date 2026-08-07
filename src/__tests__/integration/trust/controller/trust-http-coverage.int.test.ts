import { EUserGroup } from '@sauvvitech/st-packages';
import { Types } from 'mongoose';
import supertest from 'supertest';
import { app } from '../../../../../jest/setup-integration-tests';
import { ETrustEventType } from '../../../../domain/trust/entity/enums/ETrustEventType';

describe('when trust HTTP routes are exercised', () => {
  it('should cover append list get recompute and seller level', async () => {
    const sellerId = new Types.ObjectId().toHexString();
    const eventId = new Types.ObjectId().toHexString();

    const emptyList = await supertest(app.app).get('/trust-events');
    expect(emptyList.statusCode).toBe(200);
    expect(emptyList.body).toEqual([]);

    const appended = await supertest(app.app)
      .post('/trust-events')
      .set('x-user-groups', EUserGroup.BACKOFFICE)
      .set('x-user-id', 'backoffice-actor')
      .send({
        id: eventId,
        sellerId,
        type: ETrustEventType.USER_VERIFIED,
        sourceEventId: `src-${Date.now()}`,
        payload: { userId: sellerId },
      });
    expect(appended.statusCode).toBe(201);

    const listed = await supertest(app.app).get(
      `/trust-events?sellerId=${sellerId}`,
    );
    expect(listed.statusCode).toBe(200);
    expect(listed.body.some((item: { id: string }) => item.id === eventId)).toBe(
      true,
    );

    const score = await supertest(app.app).get(`/trust-scores/${sellerId}`);
    expect(score.statusCode).toBe(200);

    const recomputed = await supertest(app.app)
      .post(`/trust-scores/${sellerId}/recompute`)
      .set('x-user-groups', EUserGroup.BACKOFFICE)
      .set('x-user-id', 'backoffice-actor');
    expect(recomputed.statusCode).toBe(200);
    expect(recomputed.body.score).toBe(10);

    const level = await supertest(app.app).get(`/seller-levels/${sellerId}`);
    expect(level.statusCode).toBe(200);
    expect(level.body.level).toBe('EVOLVING');
  });
});
