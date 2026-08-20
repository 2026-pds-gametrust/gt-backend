import { EUserGroup } from '@sauvvitech/st-packages';
import { Types } from 'mongoose';
import supertest from 'supertest';
import { app } from '../../../../../jest/setup-integration-tests';
import { signTestAccessToken } from '../../../helpers/sign-test-access-token';
import { CategoryModel } from '../../../../infraestructure/db/mongo/models/category.model';
import { UserModel } from '../../../../infraestructure/db/mongo/models/user.model';
import { validCategoryMock } from '../../../__mocks__/category.mock';
import { validListingMock } from '../../../__mocks__/listing.mock';
import { validProductMock } from '../../../__mocks__/product.mock';
import { validUserMock } from '../../../__mocks__/user.mock';
import { EShippingMode } from '../../../../domain/listings/entity/enums/EShippingMode';

async function seedListingHttp() {
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
    .set(
      'Authorization',
      `Bearer ${signTestAccessToken({
        actorId: 'backoffice-actor',
        groups: [EUserGroup.BACKOFFICE],
      })}`,
    )
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
      `Bearer ${signTestAccessToken({
        actorId: user.id,
        groups: [EUserGroup.APP_USER],
      })}`,
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

describe('when seller retrieves proof code', () => {
  it('should return plaintext code for owner', async () => {
    const { user, listing } = await seedListingHttp();
    const caseId = new Types.ObjectId().toHexString();
    const opened = await supertest(app.app).post('/verification-cases').send({
      id: caseId,
      listingId: listing.id,
    });
    expect(opened.statusCode).toBe(201);
    expect(opened.body.proofCodeHash).toBeUndefined();

    const response = await supertest(app.app)
      .get(`/verification-cases/${caseId}/proof-code`)
      .set(
        'Authorization',
        `Bearer ${signTestAccessToken({
          actorId: user.id,
          groups: [EUserGroup.APP_USER],
        })}`,
      );

    expect(response.statusCode).toBe(200);
    expect(response.body.code).toHaveLength(8);
    expect(response.body.caseId).toBe(caseId);
    expect(response.body.listingId).toBe(listing.id);
    expect(response.body.issuedAt).toBeDefined();
  });
});

describe('when another seller retrieves proof code', () => {
  it('should reject cross-tenant access', async () => {
    const { listing } = await seedListingHttp();
    const caseId = new Types.ObjectId().toHexString();
    await supertest(app.app).post('/verification-cases').send({
      id: caseId,
      listingId: listing.id,
    });

    const other = validUserMock();
    await UserModel.create(other);

    const response = await supertest(app.app)
      .get(`/verification-cases/${caseId}/proof-code`)
      .set(
        'Authorization',
        `Bearer ${signTestAccessToken({
          actorId: other.id,
          groups: [EUserGroup.APP_USER],
        })}`,
      );

    expect(response.statusCode).toBe(403);
  });
});

describe('when unauthenticated client posts evidence', () => {
  it('should return 401', async () => {
    const { listing } = await seedListingHttp();
    const caseId = new Types.ObjectId().toHexString();
    await supertest(app.app).post('/verification-cases').send({
      id: caseId,
      listingId: listing.id,
    });

    const response = await supertest(app.app)
      .post(`/verification-cases/${caseId}/evidence`)
      .send({
        id: new Types.ObjectId().toHexString(),
        type: 'PHOTO',
        storageKey: 'private/evidence/1.jpg',
      });

    expect(response.statusCode).toBe(401);
  });
});

describe('when assign is called without evidence via HTTP', () => {
  it('should return 400', async () => {
    const { listing } = await seedListingHttp();
    const caseId = new Types.ObjectId().toHexString();
    await supertest(app.app).post('/verification-cases').send({
      id: caseId,
      listingId: listing.id,
    });

    const assigned = await supertest(app.app)
      .post(`/verification-cases/${caseId}/assign`)
      .set(
        'Authorization',
        `Bearer ${signTestAccessToken({
          actorId: 'backoffice-actor',
          groups: [EUserGroup.BACKOFFICE],
        })}`,
      )
      .send({ moderatorId: 'mod-1' });

    expect(assigned.statusCode).toBe(400);
  });
});
