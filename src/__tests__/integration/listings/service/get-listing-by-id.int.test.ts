import { ListingServiceFactory } from '../../../../configuration/factory/listing.service.factory';
import { ProductServiceFactory } from '../../../../configuration/factory/product.service.factory';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
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

describe('when we get a listing by id', () => {
  it('should return the listing', async () => {
    const { user, product } = await seedSellerAndProduct();
    const created = await listingService.createListing(
      validListingMock({
        sellerId: user.id,
        productId: product.id,
      }),
      sellerActor(user.id),
    );

    const found = await listingService.getListingById(created.id);

    expect(found).toMatchObject({
      id: created.id,
      sellerId: user.id,
      productId: product.id,
    });
  });
});

describe('when listing does not exist', () => {
  it('should reject with RESOURCE_NOT_FOUND', async () => {
    await expect(
      listingService.getListingById('missing-listing'),
    ).rejects.toMatchObject({
      status: 404,
      errorCode: EErrorCode.RESOURCE_NOT_FOUND,
    });
  });
});
