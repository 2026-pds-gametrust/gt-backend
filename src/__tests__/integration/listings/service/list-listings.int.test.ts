import { ListingServiceFactory } from '../../../../configuration/factory/listing.service.factory';
import { ProductServiceFactory } from '../../../../configuration/factory/product.service.factory';
import { EListingStatus } from '../../../../domain/listings/entity/enums/EListingStatus';
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

describe('when we list listings', () => {
  it('should return listings matching the seller filter', async () => {
    const { user, product } = await seedSellerAndProduct();
    const created = await listingService.createListing(
      validListingMock({
        sellerId: user.id,
        productId: product.id,
      }),
      sellerActor(user.id),
    );

    const listed = await listingService.listListings({ sellerId: user.id });

    expect(listed.some((item) => item.id === created.id)).toBe(true);
    expect(listed.every((item) => item.sellerId === user.id)).toBe(true);
  });

  it('should return empty array when no listings match', async () => {
    const listed = await listingService.listListings({
      sellerId: 'no-such-seller',
      status: EListingStatus.PUBLISHED,
    });

    expect(listed).toEqual([]);
  });
});
