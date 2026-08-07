import { ICategoryAttributeSchema } from '../../../../domain/catalog/entity/interfaces/category-attribute-schema.interface';
import { IMCategoryAttributeSchema } from '../../../db/mongo/models/category-attribute-schema.model';

export function dbToInternal(
  doc: IMCategoryAttributeSchema,
): ICategoryAttributeSchema {
  return {
    id: doc.id,
    categoryId: doc.categoryId,
    attributes: doc.attributes ?? [],
    version: doc.version,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export function internalToDb(
  schema: ICategoryAttributeSchema,
): Omit<IMCategoryAttributeSchema, '_id' | 'createdAt' | 'updatedAt'> {
  return {
    id: schema.id,
    categoryId: schema.categoryId,
    attributes: schema.attributes,
    version: schema.version,
  };
}
