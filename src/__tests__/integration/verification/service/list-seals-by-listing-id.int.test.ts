import { Types } from 'mongoose';
import { ListingServiceFactory } from '../../../../configuration/factory/listing.service.factory';
import { ProductServiceFactory } from '../../../../configuration/factory/product.service.factory';
import { VerificationCaseServiceFactory } from '../../../../configuration/factory/verification-case.service.factory';
import { SealServiceFactory } from '../../../../configuration/factory/seal.service.factory';
import { ESealStatus } from '../../../../domain/verification/entity/enums/ESealStatus';
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
const sealService = SealServiceFactory.create();

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
  return { user, listing };
}

describe('when we list seals by listing id', () => {
  it('should return granted seals for the listing', async () => {
    const { listing } = await seedListing();
    const opened = await verificationCaseService.openCase({
      id: new Types.ObjectId().toHexString(),
      listingId: listing.id,
    });
    await verificationCaseService.assignReviewer(opened.id, {
      moderatorId: 'mod-1',
    });
    await verificationCaseService.approveCase(opened.id);

    const seals = await sealService.listSealsByListingId(listing.id);

    expect(seals).toHaveLength(1);
    expect(seals[0].status).toBe(ESealStatus.GRANTED);
    expect(seals[0].listingId).toBe(listing.id);
  });

  it('should return empty array when listing has no seals', async () => {
    const { listing } = await seedListing();

    const seals = await sealService.listSealsByListingId(listing.id);

    expect(seals).toEqual([]);
  });
});
