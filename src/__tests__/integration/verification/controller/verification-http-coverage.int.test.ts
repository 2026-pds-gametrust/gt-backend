import { EUserGroup } from '@sauvvitech/st-packages';
import { signTestAccessToken } from '../../../helpers/sign-test-access-token';
import { Types } from 'mongoose';
import supertest from 'supertest';
import { app } from '../../../../../jest/setup-integration-tests';
import { CategoryModel } from '../../../../infraestructure/db/mongo/models/category.model';
import { UserModel } from '../../../../infraestructure/db/mongo/models/user.model';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { EShippingMode } from '../../../../domain/listings/entity/enums/EShippingMode';
import { validCategoryMock } from '../../../__mocks__/category.mock';
import { validListingMock } from '../../../__mocks__/listing.mock';
import { validProductMock } from '../../../__mocks__/product.mock';
import { validUserMock } from '../../../__mocks__/user.mock';
import { assertUnauthorized } from '../../../helpers/auth-assertions';
import { registerMember } from '../../../helpers/auth-http';

const backofficeBearer = () =>
  signTestAccessToken({
    actorId: 'backoffice-actor',
    groups: [EUserGroup.BACKOFFICE],
  });

async function seedListing() {
  const user = validUserMock();
  await UserModel.create(user);
  const category = validCategoryMock();
  await CategoryModel.create(category);
  const product = validProductMock({
    categoryId: category.id,
    referencePriceCents: undefined,
  });

  await supertest(app.app)
    .post('/products')
    .set('Authorization', `Bearer ${backofficeBearer()}`)
    .send({
      id: product.id,
      categoryId: product.categoryId,
      brand: product.brand,
      model: product.model,
      slug: product.slug,
    });

  const listing = validListingMock({
    sellerId: user.id,
    productId: product.id,
    shipping: { modes: [EShippingMode.PICKUP] },
  });
  const createdListing = await supertest(app.app)
    .post('/listings')
    .set(
      'Authorization',
      `Bearer ${signTestAccessToken({ actorId: user.id, groups: [EUserGroup.APP_USER] })}`,
    )
    .send({
      id: listing.id,
      sellerId: listing.sellerId,
      productId: listing.productId,
      title: listing.title,
      condition: listing.condition,
      priceCents: listing.priceCents,
      currency: listing.currency,
      media: listing.media,
      shipping: listing.shipping,
    });
  expect(createdListing.statusCode).toBe(201);

  return { user, listing };
}

describe('when verification HTTP list get reject and evidence routes are called', () => {
  it('should cover list get reject and list evidence', async () => {
    const { user, listing } = await seedListing();

    const caseId = new Types.ObjectId().toHexString();
    const opened = await supertest(app.app).post('/verification-cases').send({
      id: caseId,
      listingId: listing.id,
    });
    expect(opened.statusCode).toBe(201);

    const listed = await supertest(app.app)
      .get('/verification-cases')
      .set('Authorization', `Bearer ${backofficeBearer()}`);
    expect(listed.statusCode).toBe(200);
    expect(listed.body.items.some((item: { id: string }) => item.id === caseId)).toBe(
      true,
    );

    const got = await supertest(app.app)
      .get(`/verification-cases/${caseId}`)
      .set('Authorization', `Bearer ${backofficeBearer()}`);
    expect(got.statusCode).toBe(200);
    expect(got.body.id).toBe(caseId);

    const sellerToken = signTestAccessToken({
      actorId: user.id,
      groups: [EUserGroup.APP_USER],
    });
    const evidenceId = new Types.ObjectId().toHexString();
    await supertest(app.app)
      .post(`/verification-cases/${caseId}/evidence`)
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({
        id: evidenceId,
        type: 'PHOTO',
        storageKey: 'private/evidence/cov.jpg',
      });
    await supertest(app.app)
      .post(`/verification-cases/${caseId}/evidence`)
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({
        id: new Types.ObjectId().toHexString(),
        type: 'VIDEO',
        storageKey: 'private/evidence/cov.mp4',
      });

    await supertest(app.app)
      .post(`/verification-cases/${caseId}/assign`)
      .set('Authorization', `Bearer ${backofficeBearer()}`)
      .send({ moderatorId: 'mod-cov' });

    const evidenceList = await supertest(app.app)
      .get(`/verification-cases/${caseId}/evidence`)
      .set('Authorization', `Bearer ${sellerToken}`);
    expect(evidenceList.statusCode).toBe(200);
    expect(
      evidenceList.body.some((item: { id: string }) => item.id === evidenceId),
    ).toBe(true);

    const rejected = await supertest(app.app)
      .post(`/verification-cases/${caseId}/reject`)
      .set('Authorization', `Bearer ${backofficeBearer()}`)
      .send({ reason: 'Incomplete evidence' });
    expect(rejected.statusCode).toBe(200);
    expect(rejected.body.status).toBe('REJECTED');
  });
});

describe('when listing verification cases with OpenAPI query contract', () => {
  it('should return 400 FIELD_INVALID for unknown status', async () => {
    const response = await supertest(app.app)
      .get('/verification-cases')
      .query({ status: 'UNKNOWN' })
      .set('Authorization', `Bearer ${backofficeBearer()}`);
    expect(response.statusCode).toBe(400);
    expect(response.body.code).toBe(EErrorCode.FIELD_INVALID);
  });

  it('should return 400 FIELD_INVALID when limit is 0', async () => {
    const response = await supertest(app.app)
      .get('/verification-cases')
      .query({ limit: 0 })
      .set('Authorization', `Bearer ${backofficeBearer()}`);
    expect(response.statusCode).toBe(400);
    expect(response.body.code).toBe(EErrorCode.FIELD_INVALID);
  });

  it('should return 400 FIELD_INVALID when limit is 101', async () => {
    const response = await supertest(app.app)
      .get('/verification-cases')
      .query({ limit: 101 })
      .set('Authorization', `Bearer ${backofficeBearer()}`);
    expect(response.statusCode).toBe(400);
    expect(response.body.code).toBe(EErrorCode.FIELD_INVALID);
  });

  it('should return 200 for CHANGES_REQUESTED with coerced query types', async () => {
    const response = await supertest(app.app)
      .get('/verification-cases')
      .query({
        status: 'CHANGES_REQUESTED',
        hasAiScore: 'true',
        minScore: '0',
        maxScore: '100',
        limit: '1',
        offset: '0',
      })
      .set('Authorization', `Bearer ${backofficeBearer()}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({
      items: expect.any(Array),
      limit: 1,
      offset: 0,
    });
  });
});

describe('when an app-user lists verification cases', () => {
  it('should return 403 for list and get by id', async () => {
    const { listing } = await seedListing();
    const caseId = new Types.ObjectId().toHexString();
    await supertest(app.app).post('/verification-cases').send({
      id: caseId,
      listingId: listing.id,
    });

    const carlos = await registerMember();
    const listed = await supertest(app.app)
      .get('/verification-cases')
      .set('Authorization', `Bearer ${carlos.body.accessToken}`);
    expect(listed.statusCode).toBe(403);
    expect(listed.body).toMatchObject({ error: 'Access denied' });

    const got = await supertest(app.app)
      .get(`/verification-cases/${caseId}`)
      .set('Authorization', `Bearer ${carlos.body.accessToken}`);
    expect(got.statusCode).toBe(403);
    expect(got.body).toMatchObject({ error: 'Access denied' });
  });

  it('should return 401 when listing without a token', async () => {
    const response = await supertest(app.app).get('/verification-cases');
    assertUnauthorized(response);
  });
});

describe('when verification HTTP seal get and revoke routes are called', () => {
  it('should cover get seal by id after approve and revoke', async () => {
    const { user, listing } = await seedListing();

    const caseId = new Types.ObjectId().toHexString();
    await supertest(app.app).post('/verification-cases').send({
      id: caseId,
      listingId: listing.id,
    });

    const sellerToken = signTestAccessToken({
      actorId: user.id,
      groups: [EUserGroup.APP_USER],
    });
    await supertest(app.app)
      .post(`/verification-cases/${caseId}/evidence`)
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({
        id: new Types.ObjectId().toHexString(),
        type: 'PHOTO',
        storageKey: 'private/evidence/seal.jpg',
      });
    await supertest(app.app)
      .post(`/verification-cases/${caseId}/evidence`)
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({
        id: new Types.ObjectId().toHexString(),
        type: 'VIDEO',
        storageKey: 'private/evidence/seal.mp4',
      });

    await supertest(app.app)
      .post(`/verification-cases/${caseId}/assign`)
      .set('Authorization', `Bearer ${backofficeBearer()}`)
      .send({ moderatorId: 'mod-seal' });

    const approved = await supertest(app.app)
      .post(`/verification-cases/${caseId}/approve`)
      .set('Authorization', `Bearer ${backofficeBearer()}`)
      .send({});
    expect(approved.statusCode).toBe(200);

    const seals = await supertest(app.app).get(
      `/seals?listingId=${listing.id}`,
    );
    expect(seals.statusCode).toBe(200);
    expect(seals.body.length).toBe(1);

    const sealId = seals.body[0].id as string;
    const gotSeal = await supertest(app.app).get(`/seals/${sealId}`);
    expect(gotSeal.statusCode).toBe(200);
    expect(gotSeal.body.id).toBe(sealId);

    const revoked = await supertest(app.app)
      .post(`/seals/${sealId}/revoke`)
      .set('Authorization', `Bearer ${backofficeBearer()}`)
      .send({ sellerId: user.id });
    expect(revoked.statusCode).toBe(200);
    expect(revoked.body.status).toBe('REVOKED');
  });
});
