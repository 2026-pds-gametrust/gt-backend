import { CategoryAttributeSchemaServiceEntity } from '../../../../domain/catalog/entity/category-attribute-schema.entity';
import { EAttributeType } from '../../../../domain/catalog/entity/enums/EAttributeType';
import {
  validAttributeDefMock,
  validCategoryAttributeSchemaMock,
} from '../../../__mocks__/category-attribute-schema.mock';

describe('when constructing a category attribute schema entity', () => {
  it('should accept a valid schema and trim attribute fields', () => {
    const entity = new CategoryAttributeSchemaServiceEntity(
      validCategoryAttributeSchemaMock({
        attributes: [
          validAttributeDefMock({
            key: '  vram_gb  ',
            name: '  VRAM  ',
            unit: '  GB  ',
            group: '  TECH  ',
          }),
        ],
      }),
    );
    expect(entity.attributes[0].key).toBe('vram_gb');
    expect(entity.attributes[0].name).toBe('VRAM');
    expect(entity.version).toBe(1);
  });

  it('should accept ENUM attribute with enumValues', () => {
    const entity = new CategoryAttributeSchemaServiceEntity(
      validCategoryAttributeSchemaMock({
        attributes: [
          validAttributeDefMock({
            key: 'condition',
            valueType: EAttributeType.ENUM,
            enumValues: [' NEW ', 'used', ''],
          }),
        ],
      }),
    );
    expect(entity.attributes[0].enumValues).toEqual(['NEW', 'used']);
  });

  it('should reject missing id', () => {
    expect(
      () =>
        new CategoryAttributeSchemaServiceEntity(
          validCategoryAttributeSchemaMock({ id: ' ' }),
        ),
    ).toThrow('id is required');
  });

  it('should reject missing categoryId', () => {
    expect(
      () =>
        new CategoryAttributeSchemaServiceEntity(
          validCategoryAttributeSchemaMock({ categoryId: '' }),
        ),
    ).toThrow('categoryId is required');
  });

  it('should reject version below 1', () => {
    expect(
      () =>
        new CategoryAttributeSchemaServiceEntity(
          validCategoryAttributeSchemaMock({ version: 0 }),
        ),
    ).toThrow('version must be an integer >= 1');
  });

  it('should reject non-integer version', () => {
    expect(
      () =>
        new CategoryAttributeSchemaServiceEntity(
          validCategoryAttributeSchemaMock({ version: 1.5 }),
        ),
    ).toThrow('version must be an integer >= 1');
  });

  it('should reject non-array attributes', () => {
    expect(
      () =>
        new CategoryAttributeSchemaServiceEntity(
          validCategoryAttributeSchemaMock({
            attributes: null as any,
          }),
        ),
    ).toThrow('attributes must be an array');
  });

  it('should reject attribute without key', () => {
    expect(
      () =>
        new CategoryAttributeSchemaServiceEntity(
          validCategoryAttributeSchemaMock({
            attributes: [validAttributeDefMock({ key: '  ' })],
          }),
        ),
    ).toThrow('attribute key is required');
  });

  it('should reject attribute without name', () => {
    expect(
      () =>
        new CategoryAttributeSchemaServiceEntity(
          validCategoryAttributeSchemaMock({
            attributes: [validAttributeDefMock({ name: '' })],
          }),
        ),
    ).toThrow('attribute name is required');
  });

  it('should reject duplicate attribute keys', () => {
    expect(
      () =>
        new CategoryAttributeSchemaServiceEntity(
          validCategoryAttributeSchemaMock({
            attributes: [
              validAttributeDefMock({ key: 'vram_gb' }),
              validAttributeDefMock({ key: 'vram_gb', name: 'Other' }),
            ],
          }),
        ),
    ).toThrow('attribute key must be unique: vram_gb');
  });

  it('should reject ENUM attribute without enumValues', () => {
    expect(
      () =>
        new CategoryAttributeSchemaServiceEntity(
          validCategoryAttributeSchemaMock({
            attributes: [
              validAttributeDefMock({
                key: 'color',
                valueType: EAttributeType.ENUM,
                enumValues: [],
              }),
            ],
          }),
        ),
    ).toThrow('ENUM attribute color requires enumValues');
  });
});
