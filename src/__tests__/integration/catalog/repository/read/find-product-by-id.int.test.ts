import { ProductRepositoryRead } from '../../../../../infraestructure/repository/catalog/product.repository.read';
import { ProductModel } from '../../../../../infraestructure/db/mongo/models/product.model';
import { EErrorCode } from '../../../../../domain/common/errors/enums/EErrorCode';
import { validProductMock } from '../../../../__mocks__/product.mock';

const repositoryRead = new ProductRepositoryRead();

afterEach(() => {
  jest.restoreAllMocks();
});

describe('when we find a product by id via repository', () => {
  it('should return the product when it exists', async () => {
    const product = validProductMock();
    await ProductModel.create(product);

    const found = await repositoryRead.findProductById(product.id);

    expect(found).toMatchObject({
      id: product.id,
      slug: product.slug,
      brand: product.brand,
    });
  });

  it('should return null when the product does not exist', async () => {
    const found = await repositoryRead.findProductById('nonexistent-id');
    expect(found).toBeNull();
  });
});

describe('when ProductModel.findOne rejects for findProductById', () => {
  it('should reject with DATABASE_ERROR', async () => {
    jest
      .spyOn(ProductModel, 'findOne')
      .mockRejectedValue(new Error('mongo failure'));

    await expect(
      repositoryRead.findProductById('any-id'),
    ).rejects.toMatchObject({
      status: 500,
      errorCode: EErrorCode.DATABASE_ERROR,
    });
  });
});
