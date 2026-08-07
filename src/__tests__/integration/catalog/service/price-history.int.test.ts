import { PriceHistoryServiceFactory } from '../../../../configuration/factory/price-history.service.factory';
import { ProductServiceFactory } from '../../../../configuration/factory/product.service.factory';
import { EPriceHistorySource } from '../../../../domain/catalog/entity/enums/EPriceHistorySource';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { CategoryModel } from '../../../../infraestructure/db/mongo/models/category.model';
import { randomUUID } from 'crypto';
import { validCategoryMock } from '../../../__mocks__/category.mock';
import { validProductMock } from '../../../__mocks__/product.mock';

const priceHistoryService = PriceHistoryServiceFactory.create();
const productService = ProductServiceFactory.create();

describe('when we list price history for a product', () => {
  it('should return appended observations', async () => {
    const category = validCategoryMock();
    await CategoryModel.create(category);
    const product = validProductMock({
      categoryId: category.id,
      referencePriceCents: undefined,
    });
    await productService.createProduct(product);

    await priceHistoryService.appendPriceHistory({
      id: randomUUID(),
      productId: product.id,
      priceCents: 1000,
      source: EPriceHistorySource.MANUAL,
    });

    const list = await priceHistoryService.listByProductId(product.id);
    expect(list.length).toBeGreaterThanOrEqual(1);
    expect(list[0]).toMatchObject({
      productId: product.id,
      priceCents: expect.any(Number),
    });
  });
});

describe('when product is missing', () => {
  it('should reject with RESOURCE_NOT_FOUND', async () => {
    await expect(
      priceHistoryService.listByProductId('missing-product'),
    ).rejects.toMatchObject({
      status: 404,
      errorCode: EErrorCode.RESOURCE_NOT_FOUND,
    });
  });
});
