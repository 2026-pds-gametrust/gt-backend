import { ListingServiceFactory } from '../../../../configuration/factory/listing.service.factory';
import { ProductServiceFactory } from '../../../../configuration/factory/product.service.factory';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
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

describe('when we submit a ready listing', () => {
  it('should transition to SUBMITTED', async () => {
    const { user, product } = await seedSellerAndProduct();
    const created = await listingService.createListing(
      validListingMock({
        sellerId: user.id,
        productId: product.id,
        shipping: { modes: [EShippingMode.PICKUP] },
      }),
      sellerActor(user.id),
    );

    const submitted = await listingService.submitListing(
      created.id,
      sellerActor(user.id),
    );

    expect(submitted.status).toBe(EListingStatus.SUBMITTED);
  });
});

describe('when we submit without photos', () => {
  it('should reject with FIELD_INVALID', async () => {
    const { user, product } = await seedSellerAndProduct();
    const created = await listingService.createListing(
      validListingMock({
        sellerId: user.id,
        productId: product.id,
        media: { photoUrls: [] },
      }),
      sellerActor(user.id),
    );

    await expect(
      listingService.submitListing(created.id, sellerActor(user.id)),
    ).rejects.toMatchObject({
      status: 400,
      errorCode: EErrorCode.FIELD_INVALID,
    });
  });
});

describe('when we submit from an invalid status', () => {
  it('should reject with RESOURCE_CONFLICT', async () => {
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

    await expect(
      listingService.submitListing(created.id, sellerActor(user.id)),
    ).rejects.toMatchObject({
      status: 409,
      errorCode: EErrorCode.RESOURCE_CONFLICT,
    });
  });
});
