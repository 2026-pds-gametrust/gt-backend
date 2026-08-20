import { randomUUID } from 'crypto';
import { ListingServiceFactory } from '../../../../configuration/factory/listing.service.factory';
import { ProductServiceFactory } from '../../../../configuration/factory/product.service.factory';
import { createEventEnvelope } from '../../../../domain/common/messaging/event-envelope';
import { EListingStatus } from '../../../../domain/listings/entity/enums/EListingStatus';
import { EShippingMode } from '../../../../domain/listings/entity/enums/EShippingMode';
import { CategoryModel } from '../../../../infraestructure/db/mongo/models/category.model';
import { UserModel } from '../../../../infraestructure/db/mongo/models/user.model';
import { validCategoryMock } from '../../../__mocks__/category.mock';
import { validListingMock } from '../../../__mocks__/listing.mock';
import { validProductMock } from '../../../__mocks__/product.mock';
import { sellerActor } from '../../../__mocks__/actor.mock';
import { validUserMock } from '../../../__mocks__/user.mock';

const listingService = ListingServiceFactory.create();
const productService = ProductServiceFactory.create();

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

function approvedEnvelope(payload: Record<string, unknown>) {
  return createEventEnvelope({
    eventId: randomUUID(),
    eventType: 'verification.case.approved',
    aggregateId: randomUUID(),
    producerModule: 'verification',
    correlationId: randomUUID(),
    payload,
  });
}

describe('when applyVerificationApproved receives a submitted listing', () => {
  it('should publish the listing', async () => {
    const { user, product } = await seedSellerAndProduct();
    const created = await listingService.createListing(
      validListingMock({
        sellerId: user.id,
        productId: product.id,
        shipping: { modes: [EShippingMode.PICKUP] },
      }),
      sellerActor(user.id),
    );
    await listingService.submitListing(created.id, sellerActor(user.id));

    await listingService.applyVerificationApproved(
      approvedEnvelope({ listingId: created.id, caseId: randomUUID() }),
    );

    const listing = await listingService.getListingById(created.id);
    expect(listing.status).toBe(EListingStatus.PUBLISHED);
  });
});

describe('when applyVerificationApproved listing is already published', () => {
  it('should skip without changing status', async () => {
    const { user, product } = await seedSellerAndProduct();
    const created = await listingService.createListing(
      validListingMock({
        sellerId: user.id,
        productId: product.id,
        shipping: { modes: [EShippingMode.PICKUP] },
      }),
      sellerActor(user.id),
    );
    await listingService.submitListing(created.id, sellerActor(user.id));
    await listingService.applyVerificationApproved(
      approvedEnvelope({ listingId: created.id }),
    );

    await listingService.applyVerificationApproved(
      approvedEnvelope({ listingId: created.id }),
    );

    const listing = await listingService.getListingById(created.id);
    expect(listing.status).toBe(EListingStatus.PUBLISHED);
  });
});

describe('when applyVerificationApproved listing is not eligible', () => {
  it('should skip when status is DRAFT', async () => {
    const { user, product } = await seedSellerAndProduct();
    const created = await listingService.createListing(
      validListingMock({
        sellerId: user.id,
        productId: product.id,
      }),
      sellerActor(user.id),
    );

    await listingService.applyVerificationApproved(
      approvedEnvelope({ listingId: created.id }),
    );

    const listing = await listingService.getListingById(created.id);
    expect(listing.status).toBe(EListingStatus.DRAFT);
  });
});

describe('when applyVerificationApproved payload is incomplete', () => {
  it('should skip when listingId is missing', async () => {
    await expect(
      listingService.applyVerificationApproved(approvedEnvelope({})),
    ).resolves.toBeUndefined();
  });

  it('should skip when listing does not exist', async () => {
    await expect(
      listingService.applyVerificationApproved(
        approvedEnvelope({ listingId: 'missing-listing' }),
      ),
    ).resolves.toBeUndefined();
  });
});
