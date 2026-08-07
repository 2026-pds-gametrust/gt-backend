import { SearchDocumentServiceFactory } from '../../../../configuration/factory/search-document.service.factory';
import { QueryLogModel } from '../../../../infraestructure/db/mongo/models/query-log.model';
import { SearchDocumentModel } from '../../../../infraestructure/db/mongo/models/search-document.model';
import { validSearchDocumentMock } from '../../../__mocks__/search-favorites.mock';

const searchDocumentService = SearchDocumentServiceFactory.create();

describe('when we search documents', () => {
  it('should return matches and append a query log', async () => {
    const document = validSearchDocumentMock({
      title: 'Rare Search Token XYZ',
      brand: 'ASUS',
      model: 'RTX',
      searchText: 'rare search token xyz asus rtx',
    });
    await SearchDocumentModel.create(document);

    const results = await searchDocumentService.search({
      q: 'Rare Search Token XYZ',
    });

    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].listingId).toBe(document.listingId);

    const logs = await QueryLogModel.find({ query: 'Rare Search Token XYZ' });
    expect(logs.length).toBeGreaterThanOrEqual(1);
    expect(logs[0].resultCount).toBeGreaterThanOrEqual(1);
  });

  it('should append a query log with zero results when nothing matches', async () => {
    const query = `no-match-${Date.now()}`;
    const results = await searchDocumentService.search({ q: query });

    expect(results).toEqual([]);
    const logs = await QueryLogModel.find({ query });
    expect(logs).toHaveLength(1);
    expect(logs[0].resultCount).toBe(0);
  });
});
