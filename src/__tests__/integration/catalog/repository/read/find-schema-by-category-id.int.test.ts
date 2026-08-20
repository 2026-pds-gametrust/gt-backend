import { CategoryAttributeSchemaRepositoryRead } from '../../../../../infraestructure/repository/catalog/category-attribute-schema.repository.read';
import { CategoryAttributeSchemaModel } from '../../../../../infraestructure/db/mongo/models/category-attribute-schema.model';
import { EErrorCode } from '../../../../../domain/common/errors/enums/EErrorCode';
import {
  validAttributeDefMock,
  validCategoryAttributeSchemaMock,
} from '../../../../__mocks__/category-attribute-schema.mock';

const repositoryRead = new CategoryAttributeSchemaRepositoryRead();

afterEach(() => {
  jest.restoreAllMocks();
});

describe('when we find an attribute schema by category id via repository', () => {
  it('should return the schema when it exists', async () => {
    const schema = validCategoryAttributeSchemaMock({
      attributes: [validAttributeDefMock()],
    });
    await CategoryAttributeSchemaModel.create(schema);

    const found = await repositoryRead.findByCategoryId(schema.categoryId);

    expect(found).toMatchObject({
      id: schema.id,
      categoryId: schema.categoryId,
      version: schema.version,
    });
  });

  it('should return null when no schema exists for the category', async () => {
    const found = await repositoryRead.findByCategoryId('missing-category');
    expect(found).toBeNull();
  });
});

describe('when CategoryAttributeSchemaModel.findOne rejects for findByCategoryId', () => {
  it('should reject with DATABASE_ERROR', async () => {
    jest
      .spyOn(CategoryAttributeSchemaModel, 'findOne')
      .mockRejectedValue(new Error('mongo failure'));

    await expect(
      repositoryRead.findByCategoryId('any-category'),
    ).rejects.toMatchObject({
      status: 500,
      errorCode: EErrorCode.DATABASE_ERROR,
    });
  });
});
