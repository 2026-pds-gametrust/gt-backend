import { Types } from 'mongoose';
import { SearchDocumentService } from '../../../../domain/search/service/search-document.service';
import { EListingStatus } from '../../../../domain/listings/entity/enums/EListingStatus';
import { ESealStatus } from '../../../../domain/verification/entity/enums/ESealStatus';
import { EListingCondition } from '../../../../domain/listings/entity/enums/EListingCondition';
import { ESellerLevel } from '../../../../domain/trust/entity/enums/ESellerLevel';

function buildService(overrides: Record<string, unknown> = {}) {
  const docs = new Map<string, any>();
  const publisher = { publish: jest.fn().mockResolvedValue(undefined) };
  const service = new SearchDocumentService({
    searchDocumentRepositoryRead: {
      findByListingId: async (listingId: string) => docs.get(listingId) ?? null,
      findById: async () => null,
      search: async () => [],
    },
    searchDocumentRepositoryWrite: {
      upsertSearchDocument: async (doc: any) => {
        docs.set(doc.listingId, doc);
        return doc;
      },
      deleteByListingId: async (listingId: string) => {
        docs.delete(listingId);
        return true;
      },
    },
    listingRepositoryRead: {
      findListingById: async () => null,
      listListings: async () => [],
    },
    productRepositoryRead: {
      findProductById: async () => null,
      findProductBySlug: async () => null,
      findProductBySku: async () => null,
      listProducts: async () => [],
    },
    trustScoreRepositoryRead: {
      findTrustScoreBySellerId: async () => null,
      findTrustScoreById: async () => null,
    },
    sellerLevelRepositoryRead: {
      findSellerLevelBySellerId: async () => null,
    },
    sealRepositoryRead: {
      findSealById: async () => null,
      findActiveSealByListingId: async () => null,
      listSealsByListingId: async () => [],
    },
    searchEngine: {
      search: jest.fn().mockResolvedValue([]),
    },
    synonymService: {
      listSynonyms: jest.fn().mockResolvedValue([]),
      upsertFromTaxonomy: jest.fn(),
    },
    queryLogService: {
      appendQueryLog: jest.fn().mockResolvedValue(undefined),
    },
    eventPublisher: publisher,
    ...overrides,
  } as any);
  return { service, docs, publisher };
}

describe('when upserting search documents from snapshots', () => {
  it('should skip older snapshots when existing is newer', async () => {
    const { service, docs } = buildService();
    const listingId = new Types.ObjectId().toHexString();
    const newer = new Date('2026-01-02T00:00:00.000Z');
    const older = new Date('2026-01-01T00:00:00.000Z');
    docs.set(listingId, {
      id: listingId,
      listingId,
      sourceOccurredAt: newer,
      title: 'existing',
    });

    const result = await service.upsertFromListingSnapshot({
      listingId,
      productId: 'p1',
      categoryId: 'c1',
      sellerId: 's1',
      title: 'older',
      brand: 'b',
      model: 'm',
      condition: EListingCondition.GOOD,
      status: EListingStatus.PUBLISHED,
      priceCents: 100,
      currency: 'BRL',
      searchText: 'older',
      sourceOccurredAt: older,
    });

    expect(result.title).toBe('existing');
  });
});

describe('when reindexing a listing', () => {
  it('should return null when listing is missing', async () => {
    const { service } = buildService();
    await expect(service.reindexListing('missing')).resolves.toBeNull();
  });

  it('should delete document when listing is not published', async () => {
    const listingId = new Types.ObjectId().toHexString();
    const { service, docs } = buildService({
      listingRepositoryRead: {
        findListingById: async () => ({
          id: listingId,
          status: EListingStatus.DRAFT,
          productId: 'p1',
          sellerId: 's1',
        }),
        listListings: async () => [],
      },
    });
    docs.set(listingId, { listingId });
    await expect(service.reindexListing(listingId)).resolves.toBeNull();
    expect(docs.has(listingId)).toBe(false);
  });

  it('should return null when product is missing', async () => {
    const listingId = new Types.ObjectId().toHexString();
    const { service } = buildService({
      listingRepositoryRead: {
        findListingById: async () => ({
          id: listingId,
          status: EListingStatus.PUBLISHED,
          productId: 'p1',
          sellerId: 's1',
          title: 'GPU',
          condition: EListingCondition.GOOD,
          priceCents: 10,
          currency: 'BRL',
          createdAt: new Date(),
        }),
        listListings: async () => [],
      },
    });
    await expect(service.reindexListing(listingId)).resolves.toBeNull();
  });

  it('should upsert a published listing with trust seals and media fallback', async () => {
    const listingId = new Types.ObjectId().toHexString();
    const { service } = buildService({
      listingRepositoryRead: {
        findListingById: async () => ({
          id: listingId,
          status: EListingStatus.PUBLISHED,
          productId: 'p1',
          sellerId: 's1',
          title: 'GPU',
          condition: EListingCondition.GOOD,
          priceCents: 10,
          listPriceCents: 12,
          currency: 'BRL',
          attributes: { color: 'black' },
          shipping: { modes: ['PICKUP'], freeShipping: true },
          locationApprox: 'SP',
          media: { photoUrls: ['https://cdn/a.jpg'] },
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
        }),
        listListings: async () => [],
      },
      productRepositoryRead: {
        findProductById: async () => ({
          id: 'p1',
          categoryId: 'c1',
          brand: 'NVIDIA',
          model: '4090',
          series: 'Founders',
          specs: { vram: '24' },
        }),
        findProductBySlug: async () => null,
        findProductBySku: async () => null,
        listProducts: async () => [],
      },
      trustScoreRepositoryRead: {
        findTrustScoreBySellerId: async () => ({ score: 40 }),
        findTrustScoreById: async () => null,
      },
      sellerLevelRepositoryRead: {
        findSellerLevelBySellerId: async () => ({
          level: ESellerLevel.EVOLVING,
        }),
      },
      sealRepositoryRead: {
        findSealById: async () => null,
        findActiveSealByListingId: async () => null,
        listSealsByListingId: async () => [
          { status: ESealStatus.GRANTED, type: 'AUTHENTICITY' },
          { status: ESealStatus.REVOKED, type: 'OLD' },
        ],
      },
    });

    const doc = await service.reindexListing(listingId);
    expect(doc?.title).toBe('GPU');
    expect(doc?.sealTypes).toEqual(['AUTHENTICITY']);
    expect(doc?.thumbnailUrl).toBe('https://cdn/a.jpg');
    expect(doc?.trustScore).toBe(40);
  });
});

describe('when searching documents', () => {
  it('should publish zero-result event and expand synonyms', async () => {
    const searchEngine = { search: jest.fn().mockResolvedValue([]) };
    const publisher = { publish: jest.fn().mockResolvedValue(undefined) };
    const { service } = buildService({
      searchEngine,
      eventPublisher: publisher,
      synonymService: {
        listSynonyms: jest.fn().mockResolvedValue([
          { canonicalName: 'gpu', normalizedTerm: 'graphics' },
        ]),
        upsertFromTaxonomy: jest.fn(),
      },
    });

    const results = await service.search({ q: 'placa', userId: 'u1' });
    expect(results).toEqual([]);
    expect(searchEngine.search).toHaveBeenCalledWith(
      expect.objectContaining({
        q: expect.stringContaining('placa'),
      }),
    );
    expect(publisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: 'search.zero-result.recorded' }),
    );
  });

  it('should return results without zero-result event', async () => {
    const publisher = { publish: jest.fn().mockResolvedValue(undefined) };
    const { service } = buildService({
      searchEngine: {
        search: jest.fn().mockResolvedValue([{ id: 'd1' }]),
      },
      eventPublisher: publisher,
    });
    const results = await service.search({ q: 'gpu' });
    expect(results).toHaveLength(1);
    expect(publisher.publish).not.toHaveBeenCalled();
  });

  it('should pass undefined query through when q is empty or whitespace', async () => {
    const searchEngine = { search: jest.fn().mockResolvedValue([{ id: 'd1' }]) };
    const listSynonyms = jest.fn();
    const { service } = buildService({
      searchEngine,
      synonymService: { listSynonyms, upsertFromTaxonomy: jest.fn() },
    });

    await service.search({ q: '   ' });
    expect(listSynonyms).not.toHaveBeenCalled();
    expect(searchEngine.search).toHaveBeenCalledWith(
      expect.objectContaining({ q: '   ' }),
    );

    await service.search({});
    expect(searchEngine.search).toHaveBeenCalledWith(
      expect.objectContaining({ q: undefined }),
    );
  });

  it('should keep original query when synonyms add no extras', async () => {
    const searchEngine = { search: jest.fn().mockResolvedValue([]) };
    const { service } = buildService({
      searchEngine,
      synonymService: {
        listSynonyms: jest.fn().mockResolvedValue([
          { canonicalName: '  ', normalizedTerm: '' },
          { canonicalName: 'GPU', normalizedTerm: 'gpu' },
        ]),
        upsertFromTaxonomy: jest.fn(),
      },
    });

    await service.search({ q: 'gpu' });
    expect(searchEngine.search).toHaveBeenCalledWith(
      expect.objectContaining({ q: 'gpu' }),
    );
  });

  it('should keep original query when synonym list is empty', async () => {
    const searchEngine = { search: jest.fn().mockResolvedValue([{ id: 'd1' }]) };
    const { service } = buildService({
      searchEngine,
      synonymService: {
        listSynonyms: jest.fn().mockResolvedValue([]),
        upsertFromTaxonomy: jest.fn(),
      },
    });

    await service.search({ q: 'rtx' });
    expect(searchEngine.search).toHaveBeenCalledWith(
      expect.objectContaining({ q: 'rtx' }),
    );
  });

  it('should log empty query and empty filters on zero results without q', async () => {
    const publisher = { publish: jest.fn().mockResolvedValue(undefined) };
    const queryLogService = {
      appendQueryLog: jest.fn().mockResolvedValue(undefined),
    };
    const { service } = buildService({
      searchEngine: { search: jest.fn().mockResolvedValue([]) },
      eventPublisher: publisher,
      queryLogService,
    });

    await service.search({});

    expect(queryLogService.appendQueryLog).toHaveBeenCalledWith(
      expect.objectContaining({
        query: '',
        filters: { categoryId: undefined },
        resultCount: 0,
      }),
    );
    expect(publisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'search.zero-result.recorded',
        payload: expect.objectContaining({
          query: '',
          filters: {},
        }),
      }),
    );
  });
});

describe('when upserting a newer snapshot without an existing document', () => {
  it('should create a document using the listing id', async () => {
    const { service, docs } = buildService();
    const listingId = new Types.ObjectId().toHexString();

    const result = await service.upsertFromListingSnapshot({
      listingId,
      productId: 'p1',
      categoryId: 'c1',
      sellerId: 's1',
      title: 'fresh',
      brand: 'b',
      model: 'm',
      condition: EListingCondition.GOOD,
      status: EListingStatus.PUBLISHED,
      priceCents: 100,
      currency: 'BRL',
      searchText: 'fresh',
      sourceOccurredAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    expect(result.id).toBe(listingId);
    expect(docs.get(listingId)?.title).toBe('fresh');
  });
});

describe('when upserting a newer snapshot over an older document', () => {
  it('should replace the existing document', async () => {
    const { service, docs } = buildService();
    const listingId = new Types.ObjectId().toHexString();
    docs.set(listingId, {
      id: 'doc-existing',
      listingId,
      sourceOccurredAt: new Date('2026-01-01T00:00:00.000Z'),
      title: 'old',
    });

    const result = await service.upsertFromListingSnapshot({
      listingId,
      productId: 'p1',
      categoryId: 'c1',
      sellerId: 's1',
      title: 'new',
      brand: 'b',
      model: 'm',
      condition: EListingCondition.GOOD,
      status: EListingStatus.PUBLISHED,
      priceCents: 100,
      currency: 'BRL',
      searchText: 'new',
      sourceOccurredAt: new Date('2026-01-02T00:00:00.000Z'),
    });

    expect(result.id).toBe('doc-existing');
    expect(result.title).toBe('new');
  });
});

describe('when reindexing without brand series shipping or cover photo', () => {
  it('should build search text and prefer coverPhotoUrl when present', async () => {
    const listingId = new Types.ObjectId().toHexString();
    const { service } = buildService({
      listingRepositoryRead: {
        findListingById: async () => ({
          id: listingId,
          status: EListingStatus.PUBLISHED,
          productId: 'p1',
          sellerId: 's1',
          title: 'Bare GPU',
          condition: EListingCondition.GOOD,
          priceCents: 10,
          currency: 'BRL',
          media: { coverPhotoUrl: 'https://cdn/cover.jpg', photoUrls: [] },
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
        }),
        listListings: async () => [],
      },
      productRepositoryRead: {
        findProductById: async () => ({
          id: 'p1',
          categoryId: 'c1',
          brand: '',
          model: 'X',
          series: undefined,
          specs: {},
        }),
        findProductBySlug: async () => null,
        findProductBySku: async () => null,
        listProducts: async () => [],
      },
    });

    const doc = await service.reindexListing(listingId);
    expect(doc?.thumbnailUrl).toBe('https://cdn/cover.jpg');
    expect(doc?.freeShipping).toBeUndefined();
    expect(doc?.shippingModes).toBeUndefined();
    expect(doc?.searchText).toContain('bare gpu');
  });

  it('should fall back to new Date when updatedAt and createdAt are missing', async () => {
    const listingId = new Types.ObjectId().toHexString();
    const before = Date.now();
    const { service } = buildService({
      listingRepositoryRead: {
        findListingById: async () => ({
          id: listingId,
          status: EListingStatus.PUBLISHED,
          productId: 'p1',
          sellerId: 's1',
          title: 'No Dates',
          condition: EListingCondition.GOOD,
          priceCents: 10,
          currency: 'BRL',
          shipping: { modes: ['PICKUP'] },
          media: { photoUrls: ['https://cdn/x.jpg'] },
        }),
        listListings: async () => [],
      },
      productRepositoryRead: {
        findProductById: async () => ({
          id: 'p1',
          categoryId: 'c1',
          brand: 'AMD',
          model: '7900',
        }),
        findProductBySlug: async () => null,
        findProductBySku: async () => null,
        listProducts: async () => [],
      },
    });

    const doc = await service.reindexListing(listingId);
    expect(doc?.sourceOccurredAt.getTime()).toBeGreaterThanOrEqual(before);
  });

  it('should merge filters into query log and zero-result payload', async () => {
    const publisher = { publish: jest.fn().mockResolvedValue(undefined) };
    const queryLogService = {
      appendQueryLog: jest.fn().mockResolvedValue(undefined),
    };
    const { service } = buildService({
      searchEngine: { search: jest.fn().mockResolvedValue([]) },
      eventPublisher: publisher,
      queryLogService,
      synonymService: {
        listSynonyms: jest.fn().mockResolvedValue([
          { canonicalName: undefined, normalizedTerm: undefined },
        ]),
        upsertFromTaxonomy: jest.fn(),
      },
    });

    await service.search({
      q: 'rtx',
      filters: { brand: 'NVIDIA' },
      categoryId: 'c1',
    });

    expect(queryLogService.appendQueryLog).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: { categoryId: 'c1', brand: 'NVIDIA' },
      }),
    );
    expect(publisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          filters: { brand: 'NVIDIA' },
        }),
      }),
    );
  });
});
