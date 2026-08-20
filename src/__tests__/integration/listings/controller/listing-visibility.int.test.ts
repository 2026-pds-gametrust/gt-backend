import { EUserGroup } from '@sauvvitech/st-packages';
import { Types } from 'mongoose';
import supertest from 'supertest';
import { app } from '../../../../../jest/setup-integration-tests';
import { ListingServiceFactory } from '../../../../configuration/factory/listing.service.factory';
import { ProductServiceFactory } from '../../../../configuration/factory/product.service.factory';
import { SealServiceFactory } from '../../../../configuration/factory/seal.service.factory';
import { EListingStatus } from '../../../../domain/listings/entity/enums/EListingStatus';
import { EShippingMode } from '../../../../domain/listings/entity/enums/EShippingMode';
import { ESealType } from '../../../../domain/verification/entity/enums/ESealType';
import { CategoryModel } from '../../../../infraestructure/db/mongo/models/category.model';
import { UserModel } from '../../../../infraestructure/db/mongo/models/user.model';
import { validCategoryMock } from '../../../__mocks__/category.mock';
import { validListingMock } from '../../../__mocks__/listing.mock';
import { validProductMock } from '../../../__mocks__/product.mock';
import { backofficeActor, sellerActor } from '../../../__mocks__/actor.mock';
import { validUserMock } from '../../../__mocks__/user.mock';
import { signTestAccessToken } from '../../../helpers/sign-test-access-token';

const listingService = ListingServiceFactory.create();
const productService = ProductServiceFactory.create();
const sealService = SealServiceFactory.create();

async function seedSellerAndProduct() {
  const user = validUserMock();
  await UserModel.create(user);
  const category = validCategoryMock();
  await CategoryModel.create(category);
  const product = validProductMock({
    categoryId: category.id,
    referencePriceCents: undefined,
  });
  await productService.createProduct(product);
  return { user, product };
}

async function createPublishedListing(userId: string, productId: string) {
  const created = await listingService.createListing(
    validListingMock({
      sellerId: userId,
      productId,
      shipping: { modes: [EShippingMode.PICKUP] },
    }),
    sellerActor(userId),
  );
  await listingService.submitListing(created.id, sellerActor(userId));
  return listingService.publishListing(created.id, backofficeActor());
}

describe('when listing visibility is enforced over HTTP', () => {
  it('should hide draft listings from anonymous catalog and detail', async () => {
    const { user, product } = await seedSellerAndProduct();
    const created = await listingService.createListing(
      validListingMock({
        sellerId: user.id,
        productId: product.id,
        shipping: { modes: [EShippingMode.PICKUP] },
      }),
      sellerActor(user.id),
    );

    const listResponse = await supertest(app.app).get('/listings');
    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.body.items ?? listResponse.body).toEqual(
      expect.not.arrayContaining([
        expect.objectContaining({ id: created.id }),
      ]),
    );

    const detailResponse = await supertest(app.app).get(
      `/listings/${created.id}`,
    );
    expect(detailResponse.statusCode).toBe(404);
  });

  it('should let the seller read their draft listing', async () => {
    const { user, product } = await seedSellerAndProduct();
    const created = await listingService.createListing(
      validListingMock({
        sellerId: user.id,
        productId: product.id,
        shipping: { modes: [EShippingMode.PICKUP] },
      }),
      sellerActor(user.id),
    );

    const response = await supertest(app.app)
      .get(`/listings/${created.id}`)
      .set(
        'Authorization',
        `Bearer ${signTestAccessToken({
          actorId: user.id,
          groups: [EUserGroup.APP_USER],
        })}`,
      );

    expect(response.statusCode).toBe(200);
    expect(response.body.id).toBe(created.id);
  });

  it('should hide published listings without seal from anonymous viewers', async () => {
    const { user, product } = await seedSellerAndProduct();
    const published = await createPublishedListing(user.id, product.id);

    const detailResponse = await supertest(app.app).get(
      `/listings/${published.id}`,
    );
    expect(detailResponse.statusCode).toBe(404);
  });

  it('should expose published listings with active seal in public catalog', async () => {
    const { user, product } = await seedSellerAndProduct();
    const published = await createPublishedListing(user.id, product.id);
    await sealService.grantSeal({
      id: new Types.ObjectId().toHexString(),
      listingId: published.id,
      caseId: new Types.ObjectId().toHexString(),
      type: ESealType.POSSESSION,
      sellerId: user.id,
      sourceEventId: `seal-granted:${published.id}`,
    });

    const detailResponse = await supertest(app.app).get(
      `/listings/${published.id}`,
    );
    expect(detailResponse.statusCode).toBe(200);
    expect(detailResponse.body.status).toBe(EListingStatus.PUBLISHED);

    const listResponse = await supertest(app.app).get('/listings');
    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: published.id }),
      ]),
    );
  });

  it('should return only verified listings for another seller via sellerId filter', async () => {
    const { user, product } = await seedSellerAndProduct();
    const draft = await listingService.createListing(
      validListingMock({
        sellerId: user.id,
        productId: product.id,
        shipping: { modes: [EShippingMode.PICKUP] },
      }),
      sellerActor(user.id),
    );
    const published = await createPublishedListing(user.id, product.id);
    await sealService.grantSeal({
      id: new Types.ObjectId().toHexString(),
      listingId: published.id,
      caseId: new Types.ObjectId().toHexString(),
      type: ESealType.POSSESSION,
      sellerId: user.id,
      sourceEventId: `seal-granted:${published.id}`,
    });

    const response = await supertest(app.app).get(
      `/listings?sellerId=${user.id}`,
    );

    expect(response.statusCode).toBe(200);
    expect(response.body.map((item: { id: string }) => item.id)).toEqual([
      published.id,
    ]);
    expect(response.body.map((item: { id: string }) => item.id)).not.toContain(
      draft.id,
    );
  });
});
