import { Types } from 'mongoose';
import { ListingServiceFactory } from '../../../../configuration/factory/listing.service.factory';
import { ProductServiceFactory } from '../../../../configuration/factory/product.service.factory';
import { VerificationCaseServiceFactory } from '../../../../configuration/factory/verification-case.service.factory';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { EVerificationCaseStatus } from '../../../../domain/verification/entity/enums/EVerificationCaseStatus';
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
const verificationCaseService = VerificationCaseServiceFactory.create();

async function seedListing() {
  const user = validUserMock();
  await UserModel.create(user);
  const category = validCategoryMock();
  await CategoryModel.create(category);
  const product = validProductMock({
    categoryId: category.id,
    referencePriceCents: undefined,
  });
  await productService.createProduct(product);
  const listing = await listingService.createListing(
    validListingMock({
      sellerId: user.id,
      productId: product.id,
      shipping: { modes: [EShippingMode.PICKUP] },
    }),
    sellerActor(user.id),
  );
  return { user, product, listing };
}

describe('when we ensure an open case for a listing without one', () => {
  it('should create a PENDING case', async () => {
    const { listing } = await seedListing();

    const opened =
      await verificationCaseService.ensureOpenCaseForListing(listing.id);

    expect(opened.listingId).toBe(listing.id);
    expect(opened.status).toBe(EVerificationCaseStatus.PENDING);
  });
});

describe('when we ensure an open case for a listing that already has one', () => {
  it('should return the existing open case', async () => {
    const { listing } = await seedListing();
    const existing = await verificationCaseService.openCase({
      id: new Types.ObjectId().toHexString(),
      listingId: listing.id,
    });

    const ensured =
      await verificationCaseService.ensureOpenCaseForListing(listing.id);

    expect(ensured.id).toBe(existing.id);
  });
});

describe('when listing does not exist for ensureOpenCaseForListing', () => {
  it('should reject with RESOURCE_NOT_FOUND', async () => {
    await expect(
      verificationCaseService.ensureOpenCaseForListing('missing-listing'),
    ).rejects.toMatchObject({
      status: 404,
      errorCode: EErrorCode.RESOURCE_NOT_FOUND,
    });
  });
});
