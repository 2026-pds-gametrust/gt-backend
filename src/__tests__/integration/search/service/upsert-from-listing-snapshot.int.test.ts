import { SearchDocumentServiceFactory } from '../../../../configuration/factory/search-document.service.factory';
import { EListingStatus } from '../../../../domain/listings/entity/enums/EListingStatus';
import { SearchDocumentModel } from '../../../../infraestructure/db/mongo/models/search-document.model';
import { validSearchDocumentMock } from '../../../__mocks__/search-favorites.mock';

const searchDocumentService = SearchDocumentServiceFactory.create();

describe('when we upsert a search document from a listing snapshot', () => {
  it('should persist a new search document', async () => {
    const snapshot = {
      listingId: validSearchDocumentMock().listingId,
      productId: validSearchDocumentMock().productId,
      categoryId: validSearchDocumentMock().categoryId,
      sellerId: validSearchDocumentMock().sellerId,
      title: 'Fresh Snapshot GPU',
      brand: 'ASUS',
      model: 'RTX 4070',
      condition: 'GOOD',
      status: EListingStatus.PUBLISHED,
      priceCents: 350000,
      currency: 'BRL',
      searchText: 'fresh snapshot gpu asus rtx 4070',
      sourceOccurredAt: new Date('2026-01-02T00:00:00.000Z'),
    };

    const doc = await searchDocumentService.upsertFromListingSnapshot(snapshot);

    expect(doc).toMatchObject({
      listingId: snapshot.listingId,
      title: snapshot.title,
      status: EListingStatus.PUBLISHED,
    });

    const persisted = await SearchDocumentModel.findOne({
      listingId: snapshot.listingId,
    });
    expect(persisted).not.toBeNull();
    expect(persisted?.title).toBe(snapshot.title);
  });

  it('should keep the existing document when the snapshot is stale', async () => {
    const existing = validSearchDocumentMock({
      title: 'Current Title',
      sourceOccurredAt: new Date('2026-01-10T00:00:00.000Z'),
    });
    await SearchDocumentModel.create(existing);

    const result = await searchDocumentService.upsertFromListingSnapshot({
      listingId: existing.listingId,
      productId: existing.productId,
      categoryId: existing.categoryId,
      sellerId: existing.sellerId,
      title: 'Stale Title',
      condition: existing.condition,
      status: existing.status,
      priceCents: existing.priceCents,
      currency: existing.currency,
      searchText: existing.searchText,
      sourceOccurredAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    expect(result.title).toBe('Current Title');
    const persisted = await SearchDocumentModel.findOne({
      listingId: existing.listingId,
    });
    expect(persisted?.title).toBe('Current Title');
  });
});
