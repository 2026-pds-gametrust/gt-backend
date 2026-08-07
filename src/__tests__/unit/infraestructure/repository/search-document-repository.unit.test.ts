import { SearchDocumentModel } from '../../../../infraestructure/db/mongo/models/search-document.model';
import { SearchDocumentRepositoryRead } from '../../../../infraestructure/repository/search/search-document.repository.read';
import { SearchDocumentRepositoryWrite } from '../../../../infraestructure/repository/search/search-document.repository.write';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { validSearchDocumentMock } from '../../../__mocks__/search-favorites.mock';

const repositoryRead = new SearchDocumentRepositoryRead();
const repositoryWrite = new SearchDocumentRepositoryWrite();

describe('when search-document repository read hits a database failure', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should throw DATABASE_ERROR on findByListingId', async () => {
    jest
      .spyOn(SearchDocumentModel, 'findOne')
      .mockRejectedValueOnce(new Error('boom'));
    await expect(
      repositoryRead.findByListingId('listing-1'),
    ).rejects.toMatchObject({
      status: 500,
      errorCode: EErrorCode.DATABASE_ERROR,
    });
  });

  it('should throw DATABASE_ERROR on findById', async () => {
    jest
      .spyOn(SearchDocumentModel, 'findOne')
      .mockRejectedValueOnce(new Error('boom'));
    await expect(repositoryRead.findById('id')).rejects.toMatchObject({
      status: 500,
      errorCode: EErrorCode.DATABASE_ERROR,
    });
  });

  it('should throw DATABASE_ERROR on search', async () => {
    jest.spyOn(SearchDocumentModel, 'find').mockReturnValue({
      limit: jest.fn().mockRejectedValueOnce(new Error('boom')),
    } as never);
    await expect(repositoryRead.search({ q: 'gpu' })).rejects.toMatchObject({
      status: 500,
      errorCode: EErrorCode.DATABASE_ERROR,
    });
  });
});

describe('when search-document repository read searches with filters', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should apply categoryId filters limit and skip empty q', async () => {
    const docs = [validSearchDocumentMock({ id: 'd1' })];
    const limit = jest.fn().mockResolvedValue(docs);
    const find = jest.spyOn(SearchDocumentModel, 'find').mockReturnValue({
      limit,
    } as never);

    const result = await repositoryRead.search({
      q: '   ',
      categoryId: 'cat-1',
      filters: { brand: 'NVIDIA', vram: '24' },
      limit: 5,
      status: 'PUBLISHED',
    });

    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'PUBLISHED',
        categoryId: 'cat-1',
        'facets.brand': 'NVIDIA',
        'facets.vram': '24',
      }),
    );
    expect(
      (find.mock.calls[0] as unknown as [Record<string, unknown>])[0].$or,
    ).toBeUndefined();
    expect(limit).toHaveBeenCalledWith(5);
    expect(result[0].id).toBe('d1');
  });

  it('should default limit to 100 when limit is zero or missing', async () => {
    const limit = jest.fn().mockResolvedValue([]);
    jest.spyOn(SearchDocumentModel, 'find').mockReturnValue({
      limit,
    } as never);

    await repositoryRead.search({ q: 'gpu', limit: 0 });
    expect(limit).toHaveBeenCalledWith(100);

    await repositoryRead.search({ q: 'gpu' });
    expect(limit).toHaveBeenCalledWith(100);
  });

  it('should return mapped document on findById when found', async () => {
    const doc = validSearchDocumentMock({ id: 'doc-1' });
    jest.spyOn(SearchDocumentModel, 'findOne').mockResolvedValue(doc as never);

    await expect(repositoryRead.findById('doc-1')).resolves.toMatchObject({
      id: 'doc-1',
      listingId: doc.listingId,
    });
  });

  it('should return null on findById when missing', async () => {
    jest.spyOn(SearchDocumentModel, 'findOne').mockResolvedValue(null);
    await expect(repositoryRead.findById('missing')).resolves.toBeNull();
  });
});
describe('when search-document repository write hits a database failure', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should throw DATABASE_ERROR on upsertSearchDocument', async () => {
    jest
      .spyOn(SearchDocumentModel, 'findOneAndUpdate')
      .mockRejectedValueOnce(new Error('boom'));
    await expect(
      repositoryWrite.upsertSearchDocument(validSearchDocumentMock()),
    ).rejects.toMatchObject({
      status: 500,
      errorCode: EErrorCode.DATABASE_ERROR,
    });
  });

  it('should throw DATABASE_ERROR on deleteByListingId', async () => {
    jest
      .spyOn(SearchDocumentModel, 'deleteOne')
      .mockRejectedValueOnce(new Error('boom'));
    await expect(
      repositoryWrite.deleteByListingId('listing-1'),
    ).rejects.toMatchObject({
      status: 500,
      errorCode: EErrorCode.DATABASE_ERROR,
    });
  });
});
