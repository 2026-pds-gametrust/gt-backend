import { CategoryAttributeSchemaServiceFactory } from '../../../../configuration/factory/category-attribute-schema.service.factory';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { CategoryAttributeSchemaModel } from '../../../../infraestructure/db/mongo/models/category-attribute-schema.model';
import { CategoryModel } from '../../../../infraestructure/db/mongo/models/category.model';
import {
  validAttributeDefMock,
  validCategoryAttributeSchemaMock,
} from '../../../__mocks__/category-attribute-schema.mock';
import { validCategoryMock } from '../../../__mocks__/category.mock';

const schemaService = CategoryAttributeSchemaServiceFactory.create();

describe('when we get an attribute schema by category id', () => {
  it('should return the schema', async () => {
    const category = validCategoryMock();
    await CategoryModel.create(category);
    const schema = validCategoryAttributeSchemaMock({
      categoryId: category.id,
      attributes: [validAttributeDefMock()],
    });
    await CategoryAttributeSchemaModel.create(schema);

    const result = await schemaService.getByCategoryId(category.id);

    expect(result).toMatchObject({
      id: schema.id,
      categoryId: category.id,
      version: 1,
      attributes: [expect.objectContaining({ key: 'vram_gb' })],
    });
  });
});

describe('when the category does not exist for getByCategoryId', () => {
  it('should reject with RESOURCE_NOT_FOUND', async () => {
    await expect(
      schemaService.getByCategoryId('missing-category'),
    ).rejects.toMatchObject({
      status: 404,
      errorCode: EErrorCode.RESOURCE_NOT_FOUND,
      details: { categoryId: 'missing-category' },
    });
  });
});

describe('when the category exists but has no attribute schema', () => {
  it('should reject with RESOURCE_NOT_FOUND', async () => {
    const category = validCategoryMock();
    await CategoryModel.create(category);

    await expect(schemaService.getByCategoryId(category.id)).rejects.toMatchObject(
      {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        details: { categoryId: category.id },
      },
    );
  });
});
