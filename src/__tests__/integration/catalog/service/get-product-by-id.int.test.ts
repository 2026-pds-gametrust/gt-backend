import { ProductServiceFactory } from '../../../../configuration/factory/product.service.factory';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { CategoryModel } from '../../../../infraestructure/db/mongo/models/category.model';
import { ProductModel } from '../../../../infraestructure/db/mongo/models/product.model';
import { validCategoryMock } from '../../../__mocks__/category.mock';
import { validProductMock } from '../../../__mocks__/product.mock';

const productService = ProductServiceFactory.create();

describe('when we get a product by id', () => {
  it('should return the product', async () => {
    const category = validCategoryMock();
    await CategoryModel.create(category);
    const product = validProductMock({ categoryId: category.id });
    await ProductModel.create(product);

    const result = await productService.getProductById(product.id);

    expect(result).toMatchObject({
      id: product.id,
      slug: product.slug,
      categoryId: category.id,
      brand: product.brand,
    });
  });
});

describe('when we get a missing product', () => {
  it('should reject with RESOURCE_NOT_FOUND', async () => {
    await expect(
      productService.getProductById('missing-product'),
    ).rejects.toMatchObject({
      status: 404,
      errorCode: EErrorCode.RESOURCE_NOT_FOUND,
    });
  });
});
