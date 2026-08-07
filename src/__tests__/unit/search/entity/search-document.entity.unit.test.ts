import { SearchDocumentServiceEntity } from '../../../../domain/search/entity/search-document.entity';
import { validSearchDocumentMock } from '../../../__mocks__/search-favorites.mock';

describe('when constructing a search document entity', () => {
  it('should accept a valid search document', () => {
    const entity = new SearchDocumentServiceEntity(
      validSearchDocumentMock({
        title: '  GPU Listing  ',
        searchText: '  gpu listing  ',
      }),
    );
    expect(entity.title).toBe('GPU Listing');
    expect(entity.searchText).toBe('gpu listing');
    expect(entity.embedding).toBeNull();
  });

  it('should reject missing id', () => {
    expect(
      () =>
        new SearchDocumentServiceEntity(validSearchDocumentMock({ id: ' ' })),
    ).toThrow('id is required');
  });

  it('should reject missing listingId', () => {
    expect(
      () =>
        new SearchDocumentServiceEntity(
          validSearchDocumentMock({ listingId: '' }),
        ),
    ).toThrow('listingId is required');
  });

  it('should reject missing productId', () => {
    expect(
      () =>
        new SearchDocumentServiceEntity(
          validSearchDocumentMock({ productId: '' }),
        ),
    ).toThrow('productId is required');
  });

  it('should reject missing categoryId', () => {
    expect(
      () =>
        new SearchDocumentServiceEntity(
          validSearchDocumentMock({ categoryId: ' ' }),
        ),
    ).toThrow('categoryId is required');
  });

  it('should reject missing sellerId', () => {
    expect(
      () =>
        new SearchDocumentServiceEntity(
          validSearchDocumentMock({ sellerId: '' }),
        ),
    ).toThrow('sellerId is required');
  });

  it('should reject missing title', () => {
    expect(
      () =>
        new SearchDocumentServiceEntity(
          validSearchDocumentMock({ title: '  ' }),
        ),
    ).toThrow('title is required');
  });

  it('should reject missing condition', () => {
    expect(
      () =>
        new SearchDocumentServiceEntity(
          validSearchDocumentMock({ condition: '' }),
        ),
    ).toThrow('condition is required');
  });

  it('should reject missing status', () => {
    expect(
      () =>
        new SearchDocumentServiceEntity(
          validSearchDocumentMock({ status: ' ' }),
        ),
    ).toThrow('status is required');
  });

  it('should reject negative priceCents', () => {
    expect(
      () =>
        new SearchDocumentServiceEntity(
          validSearchDocumentMock({ priceCents: -1 }),
        ),
    ).toThrow('priceCents must be >= 0');
  });

  it('should reject null priceCents', () => {
    expect(
      () =>
        new SearchDocumentServiceEntity(
          validSearchDocumentMock({ priceCents: null as any }),
        ),
    ).toThrow('priceCents must be >= 0');
  });

  it('should reject missing currency', () => {
    expect(
      () =>
        new SearchDocumentServiceEntity(
          validSearchDocumentMock({ currency: '' }),
        ),
    ).toThrow('currency is required');
  });

  it('should reject missing searchText', () => {
    expect(
      () =>
        new SearchDocumentServiceEntity(
          validSearchDocumentMock({ searchText: '  ' }),
        ),
    ).toThrow('searchText is required');
  });

  it('should reject missing sourceOccurredAt', () => {
    expect(
      () =>
        new SearchDocumentServiceEntity(
          validSearchDocumentMock({ sourceOccurredAt: undefined as any }),
        ),
    ).toThrow('sourceOccurredAt is required');
  });
});
