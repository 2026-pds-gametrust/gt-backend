import { SearchDocumentServiceFactory } from '../../../../configuration/factory/search-document.service.factory';
import { SearchDocumentModel } from '../../../../infraestructure/db/mongo/models/search-document.model';
import { validSearchDocumentMock } from '../../../__mocks__/search-favorites.mock';

const searchDocumentService = SearchDocumentServiceFactory.create();

describe('when we delete on unpublish', () => {
  it('should remove the search document', async () => {
    const existing = validSearchDocumentMock({ title: 'To Remove' });
    await SearchDocumentModel.create(existing);

    await searchDocumentService.deleteOnUnpublish(existing.listingId);

    const persisted = await SearchDocumentModel.findOne({
      listingId: existing.listingId,
    });
    expect(persisted).toBeNull();
  });
});
