import { ProductServiceEntity } from '../../../../domain/catalog/entity/product.entity';
import { validProductMock } from '../../../__mocks__/product.mock';

describe('when constructing a product entity', () => {
  it('should accept a valid product and normalize brand slug currency', () => {
    const entity = new ProductServiceEntity(
      validProductMock({
        brand: '  ASUS  ',
        model: '  RTX  ',
        slug: '  Asus-RTX  ',
        currency: 'brl',
      }),
    );
    expect(entity.brand).toBe('ASUS');
    expect(entity.model).toBe('RTX');
    expect(entity.slug).toBe('asus-rtx');
    expect(entity.currency).toBe('BRL');
  });

  it('should default currency to BRL when referencePriceCents is set without currency', () => {
    const entity = new ProductServiceEntity(
      validProductMock({
        referencePriceCents: 1000,
        currency: undefined,
      }),
    );
    expect(entity.currency).toBe('BRL');
  });

  it('should reject missing id', () => {
    expect(
      () => new ProductServiceEntity(validProductMock({ id: ' ' })),
    ).toThrow('id is required');
  });

  it('should reject missing categoryId', () => {
    expect(
      () => new ProductServiceEntity(validProductMock({ categoryId: '' })),
    ).toThrow('categoryId is required');
  });

  it('should reject missing brand', () => {
    expect(
      () => new ProductServiceEntity(validProductMock({ brand: '  ' })),
    ).toThrow('brand is required');
  });

  it('should reject missing model', () => {
    expect(
      () => new ProductServiceEntity(validProductMock({ model: '' })),
    ).toThrow('model is required');
  });

  it('should reject missing slug', () => {
    expect(
      () => new ProductServiceEntity(validProductMock({ slug: ' ' })),
    ).toThrow('slug is required');
  });

  it('should reject blank sku when provided', () => {
    expect(
      () => new ProductServiceEntity(validProductMock({ sku: '  ' })),
    ).toThrow('sku must be non-empty when provided');
  });

  it('should reject blank mpn when provided', () => {
    expect(
      () => new ProductServiceEntity(validProductMock({ mpn: '' })),
    ).toThrow('mpn must be non-empty when provided');
  });

  it('should reject blank ean when provided', () => {
    expect(
      () => new ProductServiceEntity(validProductMock({ ean: ' ' })),
    ).toThrow('ean must be non-empty when provided');
  });

  it('should reject invalid referencePriceCents', () => {
    expect(
      () =>
        new ProductServiceEntity(
          validProductMock({ referencePriceCents: -10 }),
        ),
    ).toThrow('amountCents must be a non-negative integer');
  });

  it('should reject invalid currency on reference price', () => {
    expect(
      () =>
        new ProductServiceEntity(
          validProductMock({
            referencePriceCents: 100,
            currency: 'REAL' as any,
          }),
        ),
    ).toThrow('currency must be a 3-letter ISO code');
  });
});
