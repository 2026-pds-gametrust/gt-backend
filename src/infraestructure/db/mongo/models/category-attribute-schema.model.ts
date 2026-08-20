import { Types, model } from 'mongoose';
import { ICategoryAttributeSchema } from '../../../../domain/catalog/entity/interfaces/category-attribute-schema.interface';
import { CategoryAttributeSchemaSchema } from '../schema/category-attribute-schema.schema';

export interface IMCategoryAttributeSchema
  extends Omit<ICategoryAttributeSchema, '_id'> {
  _id: Types.ObjectId;
  updatedAt: Date;
}

export const CategoryAttributeSchemaModel = model<IMCategoryAttributeSchema>(
  'CategoryAttributeSchema',
  CategoryAttributeSchemaSchema,
);
