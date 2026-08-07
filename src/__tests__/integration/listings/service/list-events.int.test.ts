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
import { backofficeActor, sellerActor } from '../../../__mocks__/actor.mock';
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

describe('when we list events for a listing', () => {
  it('should return status transition history', async () => {
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
    await listingService.publishListing(created.id, backofficeActor());

    const events = await listingService.listEvents(created.id);

    expect(events.map((e) => e.toStatus)).toEqual(
      expect.arrayContaining([
        EListingStatus.DRAFT,
        EListingStatus.SUBMITTED,
        EListingStatus.PUBLISHED,
      ]),
    );
  });
});

describe('when listing for events does not exist', () => {
  it('should reject with RESOURCE_NOT_FOUND', async () => {
    await expect(
      listingService.listEvents('missing-listing'),
    ).rejects.toMatchObject({
      status: 404,
      errorCode: EErrorCode.RESOURCE_NOT_FOUND,
    });
  });
});
