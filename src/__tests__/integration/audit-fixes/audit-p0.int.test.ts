import { EUserGroup } from '@sauvvitech/st-packages';
import { Types } from 'mongoose';
import supertest from 'supertest';
import { app } from '../../../../jest/setup-integration-tests';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { registerMember, registrationBody } from '../../helpers/auth-http';
import { signTestAccessToken } from '../../helpers/sign-test-access-token';

describe('when registering with an invalid CPF via HTTP', () => {
  it('should return 400 FIELD_INVALID instead of 500', async () => {
    const response = await supertest(app.app)
      .post('/auth/register')
      .send(registrationBody({ cpf: '11111111111' }));

    expect(response.statusCode).toBe(400);
    expect(response.body.code).toBe(EErrorCode.FIELD_INVALID);
    expect(response.body.accessToken).toBeUndefined();
  });
});

describe('when an app-user POSTs /products', () => {
  it('should return 403 Access denied not 500', async () => {
    const carlos = await registerMember();
    const response = await supertest(app.app)
      .post('/products')
      .set('Authorization', `Bearer ${carlos.body.accessToken}`)
      .send({
        id: new Types.ObjectId().toHexString(),
        categoryId: new Types.ObjectId().toHexString(),
        brand: 'Sony',
        model: 'PS5',
        slug: `ps5-${Date.now()}`,
      });

    expect(response.statusCode).toBe(403);
    expect(response.body).toMatchObject({ error: 'Access denied' });
    expect(response.body.message).toBeUndefined();
  });
});

describe('when an app-user POSTs /search/reconcile', () => {
  it('should return 403 Access denied not 500', async () => {
    const carlos = await registerMember();
    const response = await supertest(app.app)
      .post('/search/reconcile')
      .set('Authorization', `Bearer ${carlos.body.accessToken}`);

    expect(response.statusCode).toBe(403);
    expect(response.body).toMatchObject({ error: 'Access denied' });
    expect(response.body.message).toBeUndefined();
  });
});

describe('when GET /search is called with an empty q', () => {
  it('should return 200 with an array', async () => {
    const response = await supertest(app.app).get('/search').query({ q: '' });

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});

describe('when media upload uses memory storage in test', () => {
  it('should return 201 upload grant for LISTING jpeg', async () => {
    const carlos = await registerMember();
    const response = await supertest(app.app)
      .post('/media/uploads')
      .set('Authorization', `Bearer ${carlos.body.accessToken}`)
      .send({
        purpose: 'LISTING',
        ownerId: carlos.body.user.id,
        contentType: 'image/jpeg',
        byteSize: 245000,
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.upload.url).toEqual(expect.any(String));
    expect(response.body.status).toBe('PENDING_UPLOAD');
  });
});

describe('when backoffice reconciles search', () => {
  it('should still return 200', async () => {
    const response = await supertest(app.app)
      .post('/search/reconcile')
      .set(
        'Authorization',
        `Bearer ${signTestAccessToken({
          actorId: 'backoffice-actor',
          groups: [EUserGroup.BACKOFFICE],
        })}`,
      );

    expect(response.statusCode).toBe(200);
    expect(response.body.listingsReindexed).toEqual(expect.any(Number));
  });
});
