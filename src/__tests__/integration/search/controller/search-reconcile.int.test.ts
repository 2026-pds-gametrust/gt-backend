import { EUserGroup } from '@sauvvitech/st-packages';
import { signTestAccessToken } from '../../../helpers/sign-test-access-token';
import supertest from 'supertest';
import { app } from '../../../../../jest/setup-integration-tests';
import { EListingStatus } from '../../../../domain/listings/entity/enums/EListingStatus';
import { CategoryModel } from '../../../../infraestructure/db/mongo/models/category.model';
import { ListingModel } from '../../../../infraestructure/db/mongo/models/listing.model';
import { ProductModel } from '../../../../infraestructure/db/mongo/models/product.model';
import { SearchDocumentModel } from '../../../../infraestructure/db/mongo/models/search-document.model';
import { SynonymModel } from '../../../../infraestructure/db/mongo/models/synonym.model';
import { UserModel } from '../../../../infraestructure/db/mongo/models/user.model';
import { validCategoryMock } from '../../../__mocks__/category.mock';
import { validListingMock } from '../../../__mocks__/listing.mock';
import { validProductMock } from '../../../__mocks__/product.mock';
import { validUserMock } from '../../../__mocks__/user.mock';

describe('when we reconcile search read models via HTTP', () => {
  it('should reindex published listings and upsert taxonomy synonyms', async () => {
    const user = validUserMock();
    await UserModel.create(user);

    const synonymTerm = `reconcile-syn-${Date.now()}`;
    const category = validCategoryMock({
      synonyms: [synonymTerm],
      name: `Reconcile Cat ${Date.now()}`,
      slug: `reconcile-cat-${Date.now()}`,
    });
    await CategoryModel.create(category);

    const product = validProductMock({ categoryId: category.id });
    await ProductModel.create(product);

    const listing = validListingMock({
      sellerId: user.id,
      productId: product.id,
      status: EListingStatus.PUBLISHED,
      title: `Reconcile Listing ${Date.now()}`,
    });
    await ListingModel.create(listing);

    const beforeDoc = await SearchDocumentModel.findOne({
      listingId: listing.id,
    });
    expect(beforeDoc).toBeNull();

    const beforeSynonym = await SynonymModel.findOne({
      normalizedTerm: synonymTerm,
    });
    expect(beforeSynonym).toBeNull();

    const response = await supertest(app.app)
      .post('/search/reconcile')
      .set('Authorization', `Bearer ${signTestAccessToken({ actorId: 'backoffice-actor', groups: [EUserGroup.BACKOFFICE] })}`)

    expect(response.statusCode).toBe(200);
    expect(response.body.listingsReindexed).toBeGreaterThanOrEqual(1);
    expect(response.body.synonymsUpserted).toBeGreaterThanOrEqual(1);

    const afterDoc = await SearchDocumentModel.findOne({
      listingId: listing.id,
    });
    expect(afterDoc).not.toBeNull();
    expect(afterDoc?.status).toBe(EListingStatus.PUBLISHED);

    const afterSynonym = await SynonymModel.findOne({
      normalizedTerm: synonymTerm,
    });
    expect(afterSynonym).not.toBeNull();
    expect(afterSynonym?.targetId).toBe(category.id);
  });
});
