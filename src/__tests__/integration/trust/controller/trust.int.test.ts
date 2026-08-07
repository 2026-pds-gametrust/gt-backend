import { EUserGroup } from '@sauvvitech/st-packages';
import { Types } from 'mongoose';
import supertest from 'supertest';
import { app } from '../../../../../jest/setup-integration-tests';

describe('when we append trust events and recompute via HTTP', () => {
  it('should return 201 and recompute score', async () => {
    const sellerId = new Types.ObjectId().toHexString();
    const created = await supertest(app.app)
      .post('/trust-events')
      .set('x-user-groups', EUserGroup.BACKOFFICE)
      .send({
        id: new Types.ObjectId().toHexString(),
        sellerId,
        type: 'USER_VERIFIED',
        sourceEventId: `src-${Date.now()}`,
        payload: { userId: sellerId },
      });
    expect(created.statusCode).toBe(201);

    const recomputed = await supertest(app.app)
      .post(`/trust-scores/${sellerId}/recompute`)
      .set('x-user-groups', EUserGroup.BACKOFFICE)
      .send();
    expect(recomputed.statusCode).toBe(200);
    expect(recomputed.body.score).toBe(10);

    const level = await supertest(app.app).get(`/seller-levels/${sellerId}`);
    expect(level.statusCode).toBe(200);
    expect(level.body.level).toBe('EVOLVING');
  });
});
