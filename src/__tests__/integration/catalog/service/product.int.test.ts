import { ProductServiceFactory } from '../../../../configuration/factory/product.service.factory';
import { ProductService } from '../../../../domain/catalog/service/product.service';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { CategoryModel } from '../../../../infraestructure/db/mongo/models/category.model';
import { PriceHistoryModel } from '../../../../infraestructure/db/mongo/models/price-history.model';
import { ProductModel } from '../../../../infraestructure/db/mongo/models/product.model';
import { CategoryRepositoryRead } from '../../../../infraestructure/repository/catalog/category.repository.read';
import { PriceHistoryRepositoryWrite } from '../../../../infraestructure/repository/catalog/price-history.repository.write';
import { ProductRepositoryRead } from '../../../../infraestructure/repository/catalog/product.repository.read';
import { ProductRepositoryWrite } from '../../../../infraestructure/repository/catalog/product.repository.write';
import { validCategoryMock } from '../../../__mocks__/category.mock';
import { validProductMock } from '../../../__mocks__/product.mock';

const productService = ProductServiceFactory.create();

async function seedCategory() {
  const category = validCategoryMock();
  await CategoryModel.create(category);
  return category;
}

describe('when we create a product with a unique slug', () => {
  it('should return the created product and append price history', async () => {
    const category = await seedCategory();
    const product = validProductMock({ categoryId: category.id });

    const result = await productService.createProduct(product);

    expect(result).toMatchObject({
      id: product.id,
      slug: product.slug,
      categoryId: category.id,
    });

    const history = await PriceHistoryModel.find({ productId: product.id });
    expect(history).toHaveLength(1);
    expect(history[0].priceCents).toBe(product.referencePriceCents);
  });
});

describe('when we create a product with a duplicate slug', () => {
  it('should reject with RESOURCE_CONFLICT', async () => {
    const category = await seedCategory();
    const product = validProductMock({ categoryId: category.id });
    await ProductModel.create(product);

    await expect(
      productService.createProduct({
        ...product,
        id: validProductMock().id,
        sku: `other-${Date.now()}`,
      }),
    ).rejects.toMatchObject({
      status: 409,
      errorCode: EErrorCode.RESOURCE_CONFLICT,
    });
  });
});

describe('when category does not exist', () => {
  it('should reject with RESOURCE_NOT_FOUND', async () => {
    await expect(
      productService.createProduct(
        validProductMock({ categoryId: 'missing-cat' }),
      ),
    ).rejects.toMatchObject({
      status: 404,
      errorCode: EErrorCode.RESOURCE_NOT_FOUND,
    });
  });
});

describe('when we update product reference price', () => {
  it('should append another price history entry', async () => {
    const category = await seedCategory();
    const product = validProductMock({ categoryId: category.id });
    await productService.createProduct(product);

    await productService.updateProductById(product.id, {
      productData: { referencePriceCents: 450000 },
    });

    const history = await PriceHistoryModel.find({ productId: product.id });
    expect(history.length).toBeGreaterThanOrEqual(2);
  });
});

describe('when we create a product', () => {
  it('should publish catalog.product.created via event publisher', async () => {
    const publisher = {
      publish: jest.fn().mockResolvedValue(undefined),
    };
    const service = new ProductService({
      productRepositoryRead: new ProductRepositoryRead(),
      productRepositoryWrite: new ProductRepositoryWrite(),
      categoryRepositoryRead: new CategoryRepositoryRead(),
      priceHistoryRepositoryWrite: new PriceHistoryRepositoryWrite(),
      eventPublisher: publisher,
    });

    const category = await seedCategory();
    const product = validProductMock({
      categoryId: category.id,
      referencePriceCents: undefined,
    });

    await service.createProduct(product);

    expect(publisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'catalog.product.created',
        aggregateId: product.id,
        producerModule: 'catalog',
      }),
    );
  });
});
