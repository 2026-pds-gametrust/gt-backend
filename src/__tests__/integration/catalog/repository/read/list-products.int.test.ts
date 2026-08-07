import { ProductRepositoryRead } from '../../../../../infraestructure/repository/catalog/product.repository.read';
import { ProductModel } from '../../../../../infraestructure/db/mongo/models/product.model';
import { validProductMock } from '../../../../__mocks__/product.mock';

const repositoryRead = new ProductRepositoryRead();

describe('when we list products via repository', () => {
  it('should return products matching the provided filter', async () => {
    const product = validProductMock();
    await ProductModel.create(product);

    const products = await repositoryRead.listProducts({ slug: product.slug });

    expect(products.length).toBeGreaterThanOrEqual(1);
    expect(products.some((p) => p.id === product.id)).toBe(true);
  });
});
