import { EUserGroup } from '@sauvvitech/st-packages';
import { Types } from 'mongoose';
import supertest from 'supertest';
import { app } from '../../../../../jest/setup-integration-tests';
import { CategoryModel } from '../../../../infraestructure/db/mongo/models/category.model';
import { UserModel } from '../../../../infraestructure/db/mongo/models/user.model';
import { EShippingMode } from '../../../../domain/listings/entity/enums/EShippingMode';
import { validCategoryMock } from '../../../__mocks__/category.mock';
import { validListingMock } from '../../../__mocks__/listing.mock';
import { validProductMock } from '../../../__mocks__/product.mock';
import { validUserMock } from '../../../__mocks__/user.mock';

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
    .set('x-user-groups', EUserGroup.BACKOFFICE)
    .set('x-user-id', 'backoffice-actor')
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
    .set('x-user-id', user.id)
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
    const { listing } = await seedListing();

    const caseId = new Types.ObjectId().toHexString();
    const opened = await supertest(app.app).post('/verification-cases').send({
      id: caseId,
      listingId: listing.id,
    });
    expect(opened.statusCode).toBe(201);

    const listed = await supertest(app.app).get('/verification-cases');
    expect(listed.statusCode).toBe(200);
    expect(listed.body.some((item: { id: string }) => item.id === caseId)).toBe(
      true,
    );

    const got = await supertest(app.app).get(`/verification-cases/${caseId}`);
    expect(got.statusCode).toBe(200);
    expect(got.body.id).toBe(caseId);

    await supertest(app.app)
      .post(`/verification-cases/${caseId}/assign`)
      .set('x-user-groups', EUserGroup.BACKOFFICE)
      .send({ moderatorId: 'mod-cov' });

    const evidenceId = new Types.ObjectId().toHexString();
    await supertest(app.app)
      .post(`/verification-cases/${caseId}/evidence`)
      .send({
        id: evidenceId,
        type: 'PHOTO',
        storageKey: 'private/evidence/cov.jpg',
      });

    const evidenceList = await supertest(app.app).get(
      `/verification-cases/${caseId}/evidence`,
    );
    expect(evidenceList.statusCode).toBe(200);
    expect(
      evidenceList.body.some((item: { id: string }) => item.id === evidenceId),
    ).toBe(true);

    const rejected = await supertest(app.app)
      .post(`/verification-cases/${caseId}/reject`)
      .set('x-user-groups', EUserGroup.BACKOFFICE)
      .send({ reason: 'Incomplete evidence' });
    expect(rejected.statusCode).toBe(200);
    expect(rejected.body.status).toBe('REJECTED');
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

    await supertest(app.app)
      .post(`/verification-cases/${caseId}/assign`)
      .set('x-user-groups', EUserGroup.BACKOFFICE)
      .send({ moderatorId: 'mod-seal' });

    await supertest(app.app)
      .post(`/verification-cases/${caseId}/evidence`)
      .send({
        id: new Types.ObjectId().toHexString(),
        type: 'PHOTO',
        storageKey: 'private/evidence/seal.jpg',
      });

    const approved = await supertest(app.app)
      .post(`/verification-cases/${caseId}/approve`)
      .set('x-user-groups', EUserGroup.BACKOFFICE)
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
      .set('x-user-groups', EUserGroup.BACKOFFICE)
      .send({ sellerId: user.id });
    expect(revoked.statusCode).toBe(200);
    expect(revoked.body.status).toBe('REVOKED');
  });
});
