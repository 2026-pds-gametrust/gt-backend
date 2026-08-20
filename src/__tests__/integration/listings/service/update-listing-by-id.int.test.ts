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

describe('when we update a draft listing', () => {
  it('should persist the new title and price', async () => {
    const { user, product } = await seedSellerAndProduct();
    const created = await listingService.createListing(
      validListingMock({
        sellerId: user.id,
        productId: product.id,
      }),
      sellerActor(user.id),
    );

    const updated = await listingService.updateListingById(
      created.id,
      {
        listingData: {
          title: 'Updated title',
          priceCents: 400000,
        },
      },
      sellerActor(user.id),
    );

    expect(updated).toMatchObject({
      id: created.id,
      title: 'Updated title',
      priceCents: 400000,
      status: EListingStatus.DRAFT,
    });
  });
});

describe('when we update with listPriceCents equal to priceCents', () => {
  it('should accept the update', async () => {
    const { user, product } = await seedSellerAndProduct();
    const created = await listingService.createListing(
      validListingMock({
        sellerId: user.id,
        productId: product.id,
        priceCents: 100000,
      }),
      sellerActor(user.id),
    );

    const updated = await listingService.updateListingById(
      created.id,
      {
        listingData: {
          priceCents: 150000,
          listPriceCents: 150000,
        },
      },
      sellerActor(user.id),
    );

    expect(updated.listPriceCents).toBe(150000);
  });
});

describe('when we update with listPriceCents below priceCents', () => {
  it('should reject entity validation', async () => {
    const { user, product } = await seedSellerAndProduct();
    const created = await listingService.createListing(
      validListingMock({
        sellerId: user.id,
        productId: product.id,
        priceCents: 100000,
      }),
      sellerActor(user.id),
    );

    await expect(
      listingService.updateListingById(
        created.id,
        {
          listingData: {
            priceCents: 100000,
            listPriceCents: 50000,
          },
        },
        sellerActor(user.id),
      ),
    ).rejects.toThrow('listPriceCents must be an integer >= priceCents');
  });
});

describe('when we update a published listing', () => {
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
    await listingService.publishListing(created.id, backofficeActor());

    await expect(
      listingService.updateListingById(
        created.id,
        { listingData: { title: 'Nope' } },
        sellerActor(user.id),
      ),
    ).rejects.toMatchObject({
      status: 409,
      errorCode: EErrorCode.RESOURCE_CONFLICT,
    });
  });
});

describe('when listing to update does not exist', () => {
  it('should reject with RESOURCE_NOT_FOUND', async () => {
    await expect(
      listingService.updateListingById(
        'missing-listing',
        { listingData: { title: 'Nope' } },
        sellerActor('any-seller'),
      ),
    ).rejects.toMatchObject({
      status: 404,
      errorCode: EErrorCode.RESOURCE_NOT_FOUND,
    });
  });
});
