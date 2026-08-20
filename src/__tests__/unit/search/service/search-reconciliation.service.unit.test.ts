import { SearchReconciliationService } from '../../../../domain/search/service/search-reconciliation.service';
import { EListingStatus } from '../../../../domain/listings/entity/enums/EListingStatus';
import { ESynonymTargetType } from '../../../../domain/search/entity/enums/ESynonymTargetType';

describe('when reconciling search projections', () => {
  it('should reindex published listings and rebuild category and service synonyms', async () => {
    const reindexListing = jest
      .fn()
      .mockResolvedValueOnce({ id: 'doc-1' })
      .mockResolvedValueOnce(null);
    const upsertFromTaxonomy = jest.fn().mockResolvedValue(undefined);

    const service = new SearchReconciliationService({
      listingRepositoryRead: {
        listListings: async () => [
          { id: 'l1', status: EListingStatus.PUBLISHED },
          { id: 'l2', status: EListingStatus.PUBLISHED },
        ],
      },
      categoryRepositoryRead: {
        listCategories: async () => [
          { id: 'c1', name: 'GPUs', synonyms: ['placa', '  '] },
          { id: 'c2', name: 'Consoles' },
        ],
      },
      serviceTaxonomyRepositoryRead: {
        list: async () => [
          { id: 's1', name: 'Boost', synonyms: ['elo', ''] },
          { id: 's2', name: 'Coaching' },
        ],
      },
      searchDocumentService: { reindexListing },
      synonymService: { upsertFromTaxonomy },
    } as never);

    const result = await service.reconcile();

    expect(result.listingsReindexed).toBe(1);
    expect(result.synonymsUpserted).toBeGreaterThanOrEqual(4);
    expect(upsertFromTaxonomy).toHaveBeenCalledWith(
      'placa',
      ESynonymTargetType.CATEGORY,
      'c1',
      'GPUs',
    );
    expect(upsertFromTaxonomy).toHaveBeenCalledWith(
      'elo',
      ESynonymTargetType.SERVICE,
      's1',
      'Boost',
    );
  });
});
