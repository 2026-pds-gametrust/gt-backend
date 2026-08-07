import { EListingStatus } from '../../../../domain/listings/entity/enums/EListingStatus';
import { ESynonymTargetType } from '../../../../domain/search/entity/enums/ESynonymTargetType';
import { SearchDocumentService } from '../../../../domain/search/service/search-document.service';

describe('when search expands synonyms', () => {
  it('should append matching canonical and normalized terms to engine query', async () => {
    const searchEngine = {
      search: jest.fn().mockResolvedValue([]),
    };
    const synonymService = {
      listSynonyms: jest.fn().mockResolvedValue([
        {
          id: 'syn-1',
          normalizedTerm: 'pleisteiton 5',
          targetType: ESynonymTargetType.CATEGORY,
          targetId: 'cat-1',
          canonicalName: 'PlayStation 5',
        },
      ]),
      upsertFromTaxonomy: jest.fn(),
    };
    const queryLogService = {
      appendQueryLog: jest.fn().mockResolvedValue(undefined),
    };
    const eventPublisher = {
      publish: jest.fn().mockResolvedValue(undefined),
    };

    const service = new SearchDocumentService({
      searchDocumentRepositoryRead: {
        findByListingId: jest.fn(),
        findById: jest.fn(),
        search: jest.fn(),
      } as never,
      searchDocumentRepositoryWrite: {
        upsertSearchDocument: jest.fn(),
        deleteByListingId: jest.fn(),
      } as never,
      listingRepositoryRead: { findListingById: jest.fn() } as never,
      productRepositoryRead: { findProductById: jest.fn() } as never,
      trustScoreRepositoryRead: {
        findTrustScoreBySellerId: jest.fn(),
      } as never,
      sellerLevelRepositoryRead: {
        findSellerLevelBySellerId: jest.fn(),
      } as never,
      sealRepositoryRead: { listSealsByListingId: jest.fn() } as never,
      searchEngine: searchEngine as never,
      synonymService: synonymService as never,
      queryLogService: queryLogService as never,
      eventPublisher: eventPublisher as never,
    });

    await service.search({ q: 'pleisteiton 5' });

    expect(synonymService.listSynonyms).toHaveBeenCalledWith('pleisteiton 5');
    expect(searchEngine.search).toHaveBeenCalledWith(
      expect.objectContaining({
        q: expect.stringMatching(/pleisteiton 5/i),
        status: EListingStatus.PUBLISHED,
      }),
    );
    const engineQuery = searchEngine.search.mock.calls[0][0].q as string;
    expect(engineQuery.toLowerCase()).toContain('playstation 5');
    expect(queryLogService.appendQueryLog).toHaveBeenCalledWith(
      expect.objectContaining({
        query: 'pleisteiton 5',
        resultCount: 0,
      }),
    );
    expect(eventPublisher.publish).toHaveBeenCalled();
  });
});
