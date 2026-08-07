import { Types } from 'mongoose';
import { ProductServiceFactory } from '../../../../configuration/factory/product.service.factory';
import { EProductStatus } from '../../../../domain/catalog/entity/enums/EProductStatus';
import { CategoryModel } from '../../../../infraestructure/db/mongo/models/category.model';
import { ProductModel } from '../../../../infraestructure/db/mongo/models/product.model';
import { validCategoryMock } from '../../../__mocks__/category.mock';
import { validProductMock } from '../../../__mocks__/product.mock';

const productService = ProductServiceFactory.create();

describe('when we list products with a category filter', () => {
  it('should return only products for that category', async () => {
    const categoryA = validCategoryMock({
      id: new Types.ObjectId().toHexString(),
      slug: `cat-a-${Date.now()}`,
      name: `Cat A ${Date.now()}`,
      synonyms: [],
    });
    const categoryB = validCategoryMock({
      id: new Types.ObjectId().toHexString(),
      slug: `cat-b-${Date.now()}`,
      name: `Cat B ${Date.now()}`,
      synonyms: [],
    });
    await CategoryModel.create(categoryA);
    await CategoryModel.create(categoryB);

    const productA = validProductMock({
      categoryId: categoryA.id,
      status: EProductStatus.ACTIVE,
    });
    const productB = validProductMock({
      categoryId: categoryB.id,
      status: EProductStatus.ACTIVE,
    });
    await ProductModel.create(productA);
    await ProductModel.create(productB);

    const result = await productService.listProducts({
      categoryId: categoryA.id,
    });

    expect(result.some((p) => p.id === productA.id)).toBe(true);
    expect(result.every((p) => p.categoryId === categoryA.id)).toBe(true);
    expect(result.some((p) => p.id === productB.id)).toBe(false);
  });
});

describe('when we list products and none match the filter', () => {
  it('should return an empty array', async () => {
    const result = await productService.listProducts({
      slug: `missing-product-${Date.now()}`,
    });

    expect(result).toEqual([]);
  });
});
