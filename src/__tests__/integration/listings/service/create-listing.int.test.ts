import { ListingServiceFactory } from '../../../../configuration/factory/listing.service.factory';
import { ProductServiceFactory } from '../../../../configuration/factory/product.service.factory';
import { ListingService } from '../../../../domain/listings/service/listing.service';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { EListingStatus } from '../../../../domain/listings/entity/enums/EListingStatus';
import { CategoryModel } from '../../../../infraestructure/db/mongo/models/category.model';
import { ListingEventModel } from '../../../../infraestructure/db/mongo/models/listing-event.model';
import { UserModel } from '../../../../infraestructure/db/mongo/models/user.model';
import { PriceHistoryRepositoryWrite } from '../../../../infraestructure/repository/catalog/price-history.repository.write';
import { ProductRepositoryRead } from '../../../../infraestructure/repository/catalog/product.repository.read';
import { UserRepositoryRead } from '../../../../infraestructure/repository/identity/user.repository.read';
import { ListingEventRepositoryRead } from '../../../../infraestructure/repository/listings/listing-event.repository.read';
import { ListingEventRepositoryWrite } from '../../../../infraestructure/repository/listings/listing-event.repository.write';
import { ListingRepositoryRead } from '../../../../infraestructure/repository/listings/listing.repository.read';
import { ListingRepositoryWrite } from '../../../../infraestructure/repository/listings/listing.repository.write';
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

describe('when we create a listing draft', () => {
  it('should persist DRAFT and append a listing event', async () => {
    const { user, product } = await seedSellerAndProduct();
    const listing = validListingMock({
      sellerId: user.id,
      productId: product.id,
    });

    const created = await listingService.createListing(
      listing,
      sellerActor(user.id),
    );

    expect(created).toMatchObject({
      id: listing.id,
      status: EListingStatus.DRAFT,
      quantity: 1,
    });

    const events = await ListingEventModel.find({ listingId: listing.id });
    expect(events.length).toBeGreaterThanOrEqual(1);
    expect(events[0].toStatus).toBe(EListingStatus.DRAFT);
  });
});

describe('when we create a listing with listPriceCents equal to priceCents', () => {
  it('should accept and persist the listing', async () => {
    const { user, product } = await seedSellerAndProduct();
    const priceCents = 200000;
    const created = await listingService.createListing(
      validListingMock({
        sellerId: user.id,
        productId: product.id,
        priceCents,
        listPriceCents: priceCents,
      }),
      sellerActor(user.id),
    );

    expect(created.listPriceCents).toBe(priceCents);
    expect(created.priceCents).toBe(priceCents);
  });
});

describe('when we create a listing with listPriceCents below priceCents', () => {
  it('should reject entity validation', async () => {
    const { user, product } = await seedSellerAndProduct();

    await expect(
      listingService.createListing(
        validListingMock({
          sellerId: user.id,
          productId: product.id,
          priceCents: 200000,
          listPriceCents: 199999,
        }),
        sellerActor(user.id),
      ),
    ).rejects.toThrow('listPriceCents must be an integer >= priceCents');
  });
});

describe('when seller does not exist', () => {
  it('should reject with RESOURCE_NOT_FOUND', async () => {
    const { product } = await seedSellerAndProduct();
    await expect(
      listingService.createListing(
        validListingMock({
          sellerId: 'missing-seller',
          productId: product.id,
        }),
        sellerActor('missing-seller'),
      ),
    ).rejects.toMatchObject({
      status: 404,
      errorCode: EErrorCode.RESOURCE_NOT_FOUND,
    });
  });
});

describe('when we create a listing', () => {
  it('should publish listings.listing.created via event publisher', async () => {
    const publisher = {
      publish: jest.fn().mockResolvedValue(undefined),
    };
    const service = new ListingService({
      listingRepositoryRead: new ListingRepositoryRead(),
      listingRepositoryWrite: new ListingRepositoryWrite(),
      listingEventRepositoryRead: new ListingEventRepositoryRead(),
      listingEventRepositoryWrite: new ListingEventRepositoryWrite(),
      userRepositoryRead: new UserRepositoryRead(),
      productRepositoryRead: new ProductRepositoryRead(),
      priceHistoryRepositoryWrite: new PriceHistoryRepositoryWrite(),
      eventPublisher: publisher,
    });

    const { user, product } = await seedSellerAndProduct();
    const listing = validListingMock({
      sellerId: user.id,
      productId: product.id,
    });

    await service.createListing(listing, sellerActor(user.id));

    expect(publisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'listings.listing.created',
        aggregateId: listing.id,
        producerModule: 'listings',
      }),
    );
  });
});
