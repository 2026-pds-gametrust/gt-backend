import { randomUUID } from 'crypto';
import { PriceHistoryServiceFactory } from '../../../../configuration/factory/price-history.service.factory';
import { ProductServiceFactory } from '../../../../configuration/factory/product.service.factory';
import { EPriceHistorySource } from '../../../../domain/catalog/entity/enums/EPriceHistorySource';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { CategoryModel } from '../../../../infraestructure/db/mongo/models/category.model';
import { PriceHistoryModel } from '../../../../infraestructure/db/mongo/models/price-history.model';
import { validCategoryMock } from '../../../__mocks__/category.mock';
import { validProductMock } from '../../../__mocks__/product.mock';

const priceHistoryService = PriceHistoryServiceFactory.create();
const productService = ProductServiceFactory.create();

async function seedProductWithoutReferencePrice() {
  const category = validCategoryMock();
  await CategoryModel.create(category);
  const product = validProductMock({
    categoryId: category.id,
    referencePriceCents: undefined,
  });
  await productService.createProduct(product);
  return product;
}

describe('when we append price history for an existing product', () => {
  it('should persist and return the observation', async () => {
    const product = await seedProductWithoutReferencePrice();
    const entryId = randomUUID();

    const result = await priceHistoryService.appendPriceHistory({
      id: entryId,
      productId: product.id,
      priceCents: 250000,
      source: EPriceHistorySource.MANUAL,
    });

    expect(result).toMatchObject({
      id: entryId,
      productId: product.id,
      priceCents: 250000,
      currency: 'BRL',
      source: EPriceHistorySource.MANUAL,
    });

    const stored = await PriceHistoryModel.findOne({ id: entryId });
    expect(stored).not.toBeNull();
    expect(stored?.priceCents).toBe(250000);
  });
});

describe('when we append price history for a missing product', () => {
  it('should reject with RESOURCE_NOT_FOUND', async () => {
    await expect(
      priceHistoryService.appendPriceHistory({
        id: randomUUID(),
        productId: 'missing-product',
        priceCents: 1000,
        source: EPriceHistorySource.MANUAL,
      }),
    ).rejects.toMatchObject({
      status: 404,
      errorCode: EErrorCode.RESOURCE_NOT_FOUND,
      details: { productId: 'missing-product' },
    });
  });
});

describe('when we append price history with an invalid amount', () => {
  it('should reject at entity validation', async () => {
    const product = await seedProductWithoutReferencePrice();

    await expect(
      priceHistoryService.appendPriceHistory({
        id: randomUUID(),
        productId: product.id,
        priceCents: -1,
        source: EPriceHistorySource.MANUAL,
      }),
    ).rejects.toThrow(/amountCents/);
  });
});

describe('when we list price history for a product with no observations', () => {
  it('should return an empty array', async () => {
    const product = await seedProductWithoutReferencePrice();

    const list = await priceHistoryService.listByProductId(product.id);

    expect(list).toEqual([]);
  });
});
