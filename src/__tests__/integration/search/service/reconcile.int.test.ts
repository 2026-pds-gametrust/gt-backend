import { SearchReconciliationServiceFactory } from '../../../../configuration/factory/search-reconciliation.service.factory';
import { EListingStatus } from '../../../../domain/listings/entity/enums/EListingStatus';
import { CategoryModel } from '../../../../infraestructure/db/mongo/models/category.model';
import { ListingModel } from '../../../../infraestructure/db/mongo/models/listing.model';
import { ProductModel } from '../../../../infraestructure/db/mongo/models/product.model';
import { SearchDocumentModel } from '../../../../infraestructure/db/mongo/models/search-document.model';
import { ServiceTaxonomyModel } from '../../../../infraestructure/db/mongo/models/service-taxonomy.model';
import { SynonymModel } from '../../../../infraestructure/db/mongo/models/synonym.model';
import { UserModel } from '../../../../infraestructure/db/mongo/models/user.model';
import { validCategoryMock } from '../../../__mocks__/category.mock';
import { validListingMock } from '../../../__mocks__/listing.mock';
import { validProductMock } from '../../../__mocks__/product.mock';
import { validServiceTaxonomyMock } from '../../../__mocks__/service-taxonomy.mock';
import { validUserMock } from '../../../__mocks__/user.mock';

const reconciliationService = SearchReconciliationServiceFactory.create();

describe('when we reconcile search read models', () => {
  it('should reindex published listings and upsert taxonomy synonyms', async () => {
    const user = validUserMock();
    await UserModel.create(user);

    const synonymTerm = `reconcile-svc-${Date.now()}`;
    const category = validCategoryMock({
      synonyms: [synonymTerm],
      name: `Reconcile Cat ${Date.now()}`,
      slug: `reconcile-cat-${Date.now()}`,
    });
    await CategoryModel.create(category);

    const serviceSynonym = `svc-syn-${Date.now()}`;
    const service = validServiceTaxonomyMock({
      synonyms: [serviceSynonym],
      name: `Reconcile Service ${Date.now()}`,
      slug: `reconcile-svc-${Date.now()}`,
    });
    await ServiceTaxonomyModel.create(service);

    const product = validProductMock({ categoryId: category.id });
    await ProductModel.create(product);

    const listing = validListingMock({
      sellerId: user.id,
      productId: product.id,
      status: EListingStatus.PUBLISHED,
      title: `Reconcile Listing ${Date.now()}`,
    });
    await ListingModel.create(listing);

    const result = await reconciliationService.reconcile();

    expect(result.listingsReindexed).toBeGreaterThanOrEqual(1);
    expect(result.synonymsUpserted).toBeGreaterThanOrEqual(1);

    const afterDoc = await SearchDocumentModel.findOne({
      listingId: listing.id,
    });
    expect(afterDoc).not.toBeNull();

    const afterCategorySynonym = await SynonymModel.findOne({
      normalizedTerm: synonymTerm,
    });
    expect(afterCategorySynonym).not.toBeNull();

    const afterServiceSynonym = await SynonymModel.findOne({
      normalizedTerm: serviceSynonym,
    });
    expect(afterServiceSynonym).not.toBeNull();
  });
});
