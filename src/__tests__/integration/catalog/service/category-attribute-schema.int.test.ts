import { CategoryAttributeSchemaServiceFactory } from '../../../../configuration/factory/category-attribute-schema.service.factory';
import { EAttributeType } from '../../../../domain/catalog/entity/enums/EAttributeType';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { CategoryModel } from '../../../../infraestructure/db/mongo/models/category.model';
import {
  validAttributeDefMock,
  validCategoryAttributeSchemaMock,
} from '../../../__mocks__/category-attribute-schema.mock';
import { validCategoryMock } from '../../../__mocks__/category.mock';

const schemaService = CategoryAttributeSchemaServiceFactory.create();

describe('when we upsert an attribute schema for an existing category', () => {
  it('should create the schema with version 1', async () => {
    const category = validCategoryMock();
    await CategoryModel.create(category);

    const result = await schemaService.upsertByCategoryId(category.id, {
      id: validCategoryAttributeSchemaMock().id,
      attributes: [validAttributeDefMock()],
    });

    expect(result).toMatchObject({
      categoryId: category.id,
      version: 1,
      attributes: [expect.objectContaining({ key: 'vram_gb' })],
    });
  });
});

describe('when we upsert again for the same category', () => {
  it('should bump the version', async () => {
    const category = validCategoryMock();
    await CategoryModel.create(category);

    await schemaService.upsertByCategoryId(category.id, {
      attributes: [validAttributeDefMock()],
    });

    const updated = await schemaService.upsertByCategoryId(category.id, {
      attributes: [
        validAttributeDefMock(),
        validAttributeDefMock({
          key: 'brand',
          name: 'Brand',
          valueType: EAttributeType.STRING,
          unit: undefined,
        }),
      ],
    });

    expect(updated.version).toBe(2);
    expect(updated.attributes).toHaveLength(2);
  });
});

describe('when category is missing', () => {
  it('should reject with RESOURCE_NOT_FOUND', async () => {
    await expect(
      schemaService.upsertByCategoryId('missing-category', {
        attributes: [validAttributeDefMock()],
      }),
    ).rejects.toMatchObject({
      status: 404,
      errorCode: EErrorCode.RESOURCE_NOT_FOUND,
    });
  });
});

describe('when ENUM attribute lacks enumValues', () => {
  it('should reject at entity validation', async () => {
    const category = validCategoryMock();
    await CategoryModel.create(category);

    await expect(
      schemaService.upsertByCategoryId(category.id, {
        attributes: [
          validAttributeDefMock({
            key: 'memory_type',
            valueType: EAttributeType.ENUM,
            enumValues: [],
          }),
        ],
      }),
    ).rejects.toThrow(/enumValues/);
  });
});
