import { ProductRepositoryWrite } from '../../../../../infraestructure/repository/catalog/product.repository.write';
import { ProductModel } from '../../../../../infraestructure/db/mongo/models/product.model';
import { EErrorCode } from '../../../../../domain/common/errors/enums/EErrorCode';
import { validProductMock } from '../../../../__mocks__/product.mock';

const repositoryWrite = new ProductRepositoryWrite();

afterEach(() => {
  jest.restoreAllMocks();
});

describe('when we create a product via repository', () => {
  it('should return the created product as a domain object', async () => {
    const product = validProductMock();

    const created = await repositoryWrite.createProduct(product);

    expect(created).toMatchObject({
      id: product.id,
      slug: product.slug,
      brand: product.brand,
    });
    expect(created.createdAt).toBeDefined();
  });
});

describe('when we update a product by id via repository', () => {
  it('should return the updated product when it exists', async () => {
    const product = validProductMock();
    await ProductModel.create(product);

    const updated = await repositoryWrite.updateProductById(product.id, {
      brand: 'MSI',
      referencePriceCents: 600000,
    });

    expect(updated).toMatchObject({
      id: product.id,
      brand: 'MSI',
      referencePriceCents: 600000,
    });
  });

  it('should return null when the product does not exist', async () => {
    const updated = await repositoryWrite.updateProductById('missing-id', {
      brand: 'Nope',
    });
    expect(updated).toBeNull();
  });
});

describe('when ProductModel.create rejects for createProduct', () => {
  it('should reject with DATABASE_ERROR', async () => {
    jest
      .spyOn(ProductModel, 'create')
      .mockRejectedValue(new Error('mongo failure'));

    await expect(
      repositoryWrite.createProduct(validProductMock()),
    ).rejects.toMatchObject({
      status: 500,
      errorCode: EErrorCode.DATABASE_ERROR,
    });
  });
});
