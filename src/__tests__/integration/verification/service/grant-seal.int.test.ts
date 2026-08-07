import { Types } from 'mongoose';
import { randomUUID } from 'crypto';
import { ListingServiceFactory } from '../../../../configuration/factory/listing.service.factory';
import { ProductServiceFactory } from '../../../../configuration/factory/product.service.factory';
import { SealServiceFactory } from '../../../../configuration/factory/seal.service.factory';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { ESealStatus } from '../../../../domain/verification/entity/enums/ESealStatus';
import { ESealType } from '../../../../domain/verification/entity/enums/ESealType';
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

describe('when we grant a seal', () => {
  it('should persist GRANTED seal', async () => {
    const { user, listing } = await seedListing();
    const caseId = new Types.ObjectId().toHexString();

    const seal = await sealService.grantSeal({
      id: new Types.ObjectId().toHexString(),
      listingId: listing.id,
      caseId,
      type: ESealType.POSSESSION,
      sellerId: user.id,
      sourceEventId: `seal-granted:${caseId}`,
    });

    expect(seal.status).toBe(ESealStatus.GRANTED);
    expect(seal.listingId).toBe(listing.id);
  });
});

describe('when listing already has an active seal', () => {
  it('should reject with RESOURCE_CONFLICT', async () => {
    const { user, listing } = await seedListing();
    const caseId = new Types.ObjectId().toHexString();
    await sealService.grantSeal({
      id: new Types.ObjectId().toHexString(),
      listingId: listing.id,
      caseId,
      type: ESealType.POSSESSION,
      sellerId: user.id,
      sourceEventId: `seal-granted:${caseId}`,
    });

    await expect(
      sealService.grantSeal({
        id: new Types.ObjectId().toHexString(),
        listingId: listing.id,
        caseId: randomUUID(),
        type: ESealType.POSSESSION,
        sellerId: user.id,
        sourceEventId: `seal-granted:${randomUUID()}`,
      }),
    ).rejects.toMatchObject({
      status: 409,
      errorCode: EErrorCode.RESOURCE_CONFLICT,
    });
  });
});
