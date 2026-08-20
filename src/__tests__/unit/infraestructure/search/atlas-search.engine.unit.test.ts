import { SearchDocumentModel } from '../../../../infraestructure/db/mongo/models/search-document.model';
import { AtlasSearchEngine } from '../../../../infraestructure/search/atlas-search.engine';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';

describe('when AtlasSearchEngine searches', () => {
  const engine = new AtlasSearchEngine();

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should map aggregate results to domain documents', async () => {
    jest.spyOn(SearchDocumentModel, 'aggregate').mockResolvedValueOnce([
      {
        id: 'doc-1',
        listingId: 'l1',
        productId: 'p1',
        sellerId: 's1',
        title: 'GPU',
        brand: 'NVIDIA',
        model: '4090',
        categoryId: 'c1',
        priceCents: 1000,
        currency: 'BRL',
        condition: 'NEW',
        status: 'PUBLISHED',
        searchText: 'gpu',
        facets: {},
        sourceOccurredAt: new Date(),
        updatedAt: new Date(),
      },
    ] as any);

    const results = await engine.search({
      q: 'gpu',
      categoryId: 'c1',
      filters: { vram: '24' },
      limit: 10,
    });

    expect(results).toHaveLength(1);
    expect(results[0].listingId).toBe('l1');
    expect(SearchDocumentModel.aggregate).toHaveBeenCalled();
  });

  it('should use defaults when limit and status are omitted', async () => {
    jest.spyOn(SearchDocumentModel, 'aggregate').mockResolvedValueOnce([]);
    await engine.search({});
    expect(SearchDocumentModel.aggregate).toHaveBeenCalled();
  });

  it('should throw 503 when Atlas Search index is unavailable', async () => {
    jest
      .spyOn(SearchDocumentModel, 'aggregate')
      .mockRejectedValueOnce(new Error('index search_documents_lexical not found'));

    await expect(engine.search({ q: 'gpu' })).rejects.toMatchObject({
      status: 503,
      errorCode: EErrorCode.DATABASE_ERROR,
    });
  });

  it('should throw 500 for generic aggregate failures', async () => {
    jest
      .spyOn(SearchDocumentModel, 'aggregate')
      .mockRejectedValueOnce(new Error('connection reset'));

    await expect(engine.search({ q: 'gpu' })).rejects.toMatchObject({
      status: 500,
      errorCode: EErrorCode.DATABASE_ERROR,
    });
  });
});
