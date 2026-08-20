import { randomUUID } from 'crypto';
import supertest from 'supertest';
import { app } from '../../../../../jest/setup-integration-tests';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { EListingStatus } from '../../../../domain/listings/entity/enums/EListingStatus';
import { EOrderStatus } from '../../../../domain/orders/entity/enums/EOrderStatus';
import { EShippingMode } from '../../../../domain/listings/entity/enums/EShippingMode';
import { CategoryModel } from '../../../../infraestructure/db/mongo/models/category.model';
import { ListingModel } from '../../../../infraestructure/db/mongo/models/listing.model';
import { ProductModel } from '../../../../infraestructure/db/mongo/models/product.model';
import { validCategoryMock } from '../../../__mocks__/category.mock';
import { validListingMock } from '../../../__mocks__/listing.mock';
import { validProductMock } from '../../../__mocks__/product.mock';
import { assertUnauthorized } from '../../../helpers/auth-assertions';
import { registerMember } from '../../../helpers/auth-http';
import { OrderServiceFactory } from '../../../../configuration/factory/order.service.factory';
import { ListingServiceFactory } from '../../../../configuration/factory/listing.service.factory';
import { ProductServiceFactory } from '../../../../configuration/factory/product.service.factory';
import { UserModel } from '../../../../infraestructure/db/mongo/models/user.model';
import { validUserMock } from '../../../__mocks__/user.mock';
import { backofficeActor, sellerActor } from '../../../__mocks__/actor.mock';

const orderService = OrderServiceFactory.create();
const listingService = ListingServiceFactory.create();
const productService = ProductServiceFactory.create();

async function seedPublishedListing() {
  const seller = validUserMock();
  const buyer = validUserMock();
  await UserModel.create([seller, buyer]);

  const category = validCategoryMock();
  await CategoryModel.create(category);
  const product = validProductMock({
    categoryId: category.id,
    referencePriceCents: undefined,
  });
  await productService.createProduct(product);

  const listing = await listingService.createListing(
    validListingMock({
      sellerId: seller.id,
      productId: product.id,
      shipping: { modes: [EShippingMode.PICKUP] },
      buyNowEnabled: true,
    }),
    sellerActor(seller.id),
  );
  const submitted = await listingService.submitListing(
    listing.id,
    sellerActor(seller.id),
  );
  expect(submitted.status).toBe(EListingStatus.SUBMITTED);

  const published = await listingService.publishListing(
    listing.id,
    backofficeActor(),
  );
  expect(published.status).toBe(EListingStatus.PUBLISHED);

  return { seller, buyer, listing: published };
}

describe('when Lucas buys a published listing', () => {
  it('should confirm the order and mark the listing sold', async () => {
    const { seller, buyer, listing } = await seedPublishedListing();

    const order = await orderService.createBuyNowOrder(
      {
        id: randomUUID(),
        listingId: listing.id,
        shippingMode: EShippingMode.PICKUP,
      },
      { actorId: buyer.id, groups: ['APP_USER'] },
    );

    expect(order.status).toBe(EOrderStatus.CONFIRMED);
    expect(order.buyerId).toBe(buyer.id);
    expect(order.sellerId).toBe(seller.id);

    const updatedListing = await ListingModel.findOne({ id: listing.id });
    expect(updatedListing?.status).toBe(EListingStatus.SOLD);
  });
});

describe('when the seller tries to buy their own listing', () => {
  it('should reject with 403', async () => {
    const { seller, listing } = await seedPublishedListing();

    await expect(
      orderService.createBuyNowOrder(
        {
          id: randomUUID(),
          listingId: listing.id,
          shippingMode: EShippingMode.PICKUP,
        },
        sellerActor(seller.id),
      ),
    ).rejects.toMatchObject({
      status: 403,
      errorCode: EErrorCode.FIELD_INVALID,
    });
  });
});

describe('when two buyers compete for the same listing', () => {
  it('should allow one success and one LISTING_ALREADY_RESERVED', async () => {
    const { buyer, listing } = await seedPublishedListing();
    const otherBuyer = validUserMock();
    await UserModel.create(otherBuyer);

    const first = orderService.createBuyNowOrder(
      {
        id: randomUUID(),
        listingId: listing.id,
        shippingMode: EShippingMode.PICKUP,
      },
      { actorId: buyer.id, groups: ['APP_USER'] },
    );

    const second = orderService.createBuyNowOrder(
      {
        id: randomUUID(),
        listingId: listing.id,
        shippingMode: EShippingMode.PICKUP,
      },
      { actorId: otherBuyer.id, groups: ['APP_USER'] },
    );

    const results = await Promise.allSettled([first, second]);
    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    const reason = (rejected[0] as PromiseRejectedResult).reason as {
      status?: number;
      errorCode?: EErrorCode;
    };
    expect(reason.status).toBe(409);
    expect([
      EErrorCode.LISTING_ALREADY_RESERVED,
      EErrorCode.LISTING_NOT_AVAILABLE_FOR_PURCHASE,
    ]).toContain(reason.errorCode);
  });
});

describe('when POST /orders is called without a token', () => {
  it('should return 401', async () => {
    const response = await supertest(app.app).post('/orders').send({
      listingId: randomUUID(),
      shippingMode: EShippingMode.PICKUP,
    });
    expect(response.statusCode).toBe(401);
    assertUnauthorized(response);
  });
});

describe('when buyer reads order via HTTP', () => {
  it('should return 200 for buyer and 404 for stranger', async () => {
    const { listing } = await seedPublishedListing();
    const lucas = await registerMember();
    const stranger = await registerMember();

    const created = await supertest(app.app)
      .post('/orders')
      .set('Authorization', `Bearer ${lucas.body.accessToken}`)
      .send({
        id: randomUUID(),
        listingId: listing.id,
        shippingMode: EShippingMode.PICKUP,
      });

    expect(created.statusCode).toBe(201);
    expect(created.body.status).toBe(EOrderStatus.CONFIRMED);

    const buyerGet = await supertest(app.app)
      .get(`/orders/${created.body.id}`)
      .set('Authorization', `Bearer ${lucas.body.accessToken}`);
    expect(buyerGet.statusCode).toBe(200);

    const strangerGet = await supertest(app.app)
      .get(`/orders/${created.body.id}`)
      .set('Authorization', `Bearer ${stranger.body.accessToken}`);
    expect(strangerGet.statusCode).toBe(404);
  });
});
