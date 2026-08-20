import { Types } from 'mongoose';
import { EAttributeFacetOn } from '../../domain/catalog/entity/enums/EAttributeFacetOn';
import { EAttributeType } from '../../domain/catalog/entity/enums/EAttributeType';
import {
  IAttributeDef,
  ICategoryAttributeSchema,
} from '../../domain/catalog/entity/interfaces/category-attribute-schema.interface';

export const validAttributeDefMock = (
  override?: Partial<IAttributeDef>,
): IAttributeDef => ({
  key: 'vram_gb',
  name: 'VRAM (GB)',
  valueType: EAttributeType.NUMBER,
  required: true,
  filterable: true,
  facetOn: EAttributeFacetOn.PRODUCT,
  unit: 'GB',
  group: 'TECHNICAL',
  ...override,
});

export const validCategoryAttributeSchemaMock = (
  override?: Partial<ICategoryAttributeSchema>,
): ICategoryAttributeSchema => ({
  id: new Types.ObjectId().toHexString(),
  categoryId: new Types.ObjectId().toHexString(),
  attributes: [validAttributeDefMock()],
  version: 1,
  createdAt: new Date(),
  ...override,
});
