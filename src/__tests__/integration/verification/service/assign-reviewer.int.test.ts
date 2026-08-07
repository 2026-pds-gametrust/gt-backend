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

describe('when we assign a reviewer', () => {
  it('should transition to IN_REVIEW', async () => {
    const { listing } = await seedListing();
    const opened = await verificationCaseService.openCase({
      id: new Types.ObjectId().toHexString(),
      listingId: listing.id,
    });

    const assigned = await verificationCaseService.assignReviewer(opened.id, {
      moderatorId: 'mod-1',
    });

    expect(assigned.status).toBe(EVerificationCaseStatus.IN_REVIEW);
    expect(assigned.moderatorId).toBe('mod-1');
  });
});

describe('when moderatorId is empty', () => {
  it('should reject with FIELD_INVALID', async () => {
    const { listing } = await seedListing();
    const opened = await verificationCaseService.openCase({
      id: new Types.ObjectId().toHexString(),
      listingId: listing.id,
    });

    await expect(
      verificationCaseService.assignReviewer(opened.id, { moderatorId: '  ' }),
    ).rejects.toMatchObject({
      status: 400,
      errorCode: EErrorCode.FIELD_INVALID,
    });
  });
});

describe('when assign reviewer transition is invalid', () => {
  it('should reject with RESOURCE_CONFLICT', async () => {
    const { listing } = await seedListing();
    const opened = await verificationCaseService.openCase({
      id: new Types.ObjectId().toHexString(),
      listingId: listing.id,
    });
    await verificationCaseService.assignReviewer(opened.id, {
      moderatorId: 'mod-1',
    });

    await expect(
      verificationCaseService.assignReviewer(opened.id, {
        moderatorId: 'mod-2',
      }),
    ).rejects.toMatchObject({
      status: 409,
      errorCode: EErrorCode.RESOURCE_CONFLICT,
    });
  });
});
