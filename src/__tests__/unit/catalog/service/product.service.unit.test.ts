import { Types } from 'mongoose';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { IEventPublisher } from '../../../../domain/common/messaging/event-publisher.interface';
import { ICategory } from '../../../../domain/catalog/entity/interfaces/category.interface';
import { IProduct } from '../../../../domain/catalog/entity/interfaces/product.interface';
import { ProductService } from '../../../../domain/catalog/service/product.service';
import { validCategoryMock } from '../../../__mocks__/category.mock';
import { validProductMock } from '../../../__mocks__/product.mock';

function buildService(overrides: {
  products?: Map<string, IProduct>;
  categories?: Map<string, ICategory>;
  updateProductById?: (
    id: string,
    data: Partial<IProduct>,
  ) => Promise<IProduct | null>;
} = {}) {
  const products = overrides.products ?? new Map<string, IProduct>();
  const categories = overrides.categories ?? new Map<string, ICategory>();
  const priceHistory: unknown[] = [];
  const publisher: IEventPublisher = {
    publish: jest.fn().mockResolvedValue(undefined),
  };

  const service = new ProductService({
    productRepositoryRead: {
      findProductById: async (id: string) => products.get(id) ?? null,
      findProductBySlug: async (slug: string) =>
        [...products.values()].find((p) => p.slug === slug) ?? null,
      findProductBySku: async (sku: string) =>
        [...products.values()].find((p) => p.sku === sku) ?? null,
      listProducts: async () => [...products.values()],
    },
    productRepositoryWrite: {
      createProduct: async (product: IProduct) => {
        products.set(product.id, product);
        return product;
      },
      updateProductById:
        overrides.updateProductById ??
        (async (id: string, data: Partial<IProduct>) => {
          const existing = products.get(id);
          if (!existing) return null;
          const updated = { ...existing, ...data };
          products.set(id, updated);
          return updated;
        }),
    },
    categoryRepositoryRead: {
      findCategoryById: async (id: string) => categories.get(id) ?? null,
      findCategoryBySlug: async () => null,
      findCategoryByName: async () => null,
      findCategoryBySynonym: async () => null,
      listCategories: async () => [...categories.values()],
    },
    priceHistoryRepositoryWrite: {
      appendPriceHistory: async (entry: unknown) => {
        priceHistory.push(entry);
        return entry as never;
      },
    },
    eventPublisher: publisher,
  });

  return { service, products, categories, publisher, priceHistory };
}

describe('when updating a product sku to a conflicting value', () => {
  it('should reject with RESOURCE_CONFLICT', async () => {
    const category = validCategoryMock();
    const product = validProductMock({
      categoryId: category.id,
      sku: 'sku-a',
    });
    const other = validProductMock({
      categoryId: category.id,
      sku: 'sku-b',
      slug: 'other-slug',
    });
    const { service } = buildService({
      categories: new Map([[category.id, category]]),
      products: new Map([
        [product.id, product],
        [other.id, other],
      ]),
    });

    await expect(
      service.updateProductById(product.id, {
        productData: { sku: 'sku-b' },
      }),
    ).rejects.toMatchObject({
      status: 409,
      errorCode: EErrorCode.RESOURCE_CONFLICT,
    });
  });
});

describe('when updating a product sku to the same owned sku', () => {
  it('should allow the update without conflict', async () => {
    const category = validCategoryMock();
    const product = validProductMock({
      categoryId: category.id,
      sku: 'sku-keep',
      referencePriceCents: undefined,
      currency: undefined,
    });
    const { service } = buildService({
      categories: new Map([[category.id, category]]),
      products: new Map([[product.id, product]]),
    });

    const updated = await service.updateProductById(product.id, {
      productData: { brand: 'UpdatedBrand', sku: 'sku-keep' },
    });

    expect(updated.brand).toBe('UpdatedBrand');
  });
});

describe('when update product write returns null', () => {
  it('should reject with RESOURCE_NOT_FOUND', async () => {
    const category = validCategoryMock();
    const product = validProductMock({ categoryId: category.id });
    const { service } = buildService({
      categories: new Map([[category.id, category]]),
      products: new Map([[product.id, product]]),
      updateProductById: async () => null,
    });

    await expect(
      service.updateProductById(product.id, {
        productData: { brand: 'Ghost' },
      }),
    ).rejects.toMatchObject({
      status: 404,
      errorCode: EErrorCode.RESOURCE_NOT_FOUND,
    });
  });
});

describe('when creating a product without reference price', () => {
  it('should not append price history', async () => {
    const category = validCategoryMock();
    const { service, priceHistory } = buildService({
      categories: new Map([[category.id, category]]),
    });

    await service.createProduct(
      validProductMock({
        id: new Types.ObjectId().toHexString(),
        categoryId: category.id,
        referencePriceCents: undefined,
        currency: undefined,
        sku: undefined,
      }),
    );

    expect(priceHistory).toHaveLength(0);
  });
});

describe('when updating reference price without currency', () => {
  it('should default currency to BRL in price history', async () => {
    const category = validCategoryMock();
    const product = validProductMock({
      categoryId: category.id,
      referencePriceCents: undefined,
      currency: undefined,
      sku: undefined,
    });
    const { service, priceHistory } = buildService({
      categories: new Map([[category.id, category]]),
      products: new Map([[product.id, product]]),
    });

    await service.updateProductById(product.id, {
      productData: { referencePriceCents: 12345 },
    });

    expect(priceHistory).toHaveLength(1);
    expect((priceHistory[0] as { currency: string }).currency).toBe('BRL');
  });
});
