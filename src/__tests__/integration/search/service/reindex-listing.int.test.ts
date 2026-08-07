import { SearchDocumentServiceFactory } from '../../../../configuration/factory/search-document.service.factory';
import { EListingStatus } from '../../../../domain/listings/entity/enums/EListingStatus';
import { CategoryModel } from '../../../../infraestructure/db/mongo/models/category.model';
import { ListingModel } from '../../../../infraestructure/db/mongo/models/listing.model';
import { ProductModel } from '../../../../infraestructure/db/mongo/models/product.model';
import { SearchDocumentModel } from '../../../../infraestructure/db/mongo/models/search-document.model';
import { UserModel } from '../../../../infraestructure/db/mongo/models/user.model';
import { validCategoryMock } from '../../../__mocks__/category.mock';
import { validListingMock } from '../../../__mocks__/listing.mock';
import { validProductMock } from '../../../__mocks__/product.mock';
import { validSearchDocumentMock } from '../../../__mocks__/search-favorites.mock';
import { validUserMock } from '../../../__mocks__/user.mock';

const searchDocumentService = SearchDocumentServiceFactory.create();

describe('when we reindex a published listing', () => {
  it('should upsert a search document', async () => {
    const user = validUserMock();
    await UserModel.create(user);
    const category = validCategoryMock();
    await CategoryModel.create(category);
    const product = validProductMock({ categoryId: category.id });
    await ProductModel.create(product);
    const listing = validListingMock({
      sellerId: user.id,
      productId: product.id,
      status: EListingStatus.PUBLISHED,
      title: 'Unique Search GPU Alpha',
    });
    await ListingModel.create(listing);

    const doc = await searchDocumentService.reindexListing(listing.id);

    expect(doc).toMatchObject({
      listingId: listing.id,
      productId: product.id,
      categoryId: category.id,
      status: EListingStatus.PUBLISHED,
      title: listing.title,
    });

    const persisted = await SearchDocumentModel.findOne({
      listingId: listing.id,
    });
    expect(persisted).not.toBeNull();
  });
});

describe('when we reindex a non-published listing', () => {
  it('should delete the search document and return null', async () => {
    const user = validUserMock();
    await UserModel.create(user);
    const category = validCategoryMock();
    await CategoryModel.create(category);
    const product = validProductMock({ categoryId: category.id });
    await ProductModel.create(product);
    const listing = validListingMock({
      sellerId: user.id,
      productId: product.id,
      status: EListingStatus.PAUSED,
      title: 'Paused Listing',
    });
    await ListingModel.create(listing);
    await SearchDocumentModel.create(
      validSearchDocumentMock({
        listingId: listing.id,
        productId: product.id,
        categoryId: category.id,
        sellerId: user.id,
      }),
    );

    const doc = await searchDocumentService.reindexListing(listing.id);

    expect(doc).toBeNull();
    const persisted = await SearchDocumentModel.findOne({
      listingId: listing.id,
    });
    expect(persisted).toBeNull();
  });
});

describe('when we reindex a missing listing', () => {
  it('should return null', async () => {
    const doc = await searchDocumentService.reindexListing(
      validListingMock().id,
    );
    expect(doc).toBeNull();
  });
});
