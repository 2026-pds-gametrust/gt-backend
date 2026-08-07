import { Schema } from 'mongoose';
import { EAttributeFacetOn } from '../../../../domain/catalog/entity/enums/EAttributeFacetOn';
import { EAttributeType } from '../../../../domain/catalog/entity/enums/EAttributeType';
import type { IMCategoryAttributeSchema } from '../models/category-attribute-schema.model';

const AttributeDefSchema = new Schema(
  {
    key: { type: String, required: true },
    name: { type: String, required: true },
    valueType: {
      type: String,
      enum: Object.values(EAttributeType),
      required: true,
    },
    required: { type: Boolean, required: true },
    filterable: { type: Boolean, required: true },
    facetOn: {
      type: String,
      enum: Object.values(EAttributeFacetOn),
      required: true,
    },
    enumValues: { type: [String], default: undefined },
    unit: { type: String },
    maxLength: { type: Number },
    allowVariations: { type: Boolean },
    group: { type: String },
  },
  { _id: false },
);

export const CategoryAttributeSchemaSchema =
  new Schema<IMCategoryAttributeSchema>(
    {
      id: { type: String, required: true, unique: true },
      categoryId: { type: String, required: true, unique: true, index: true },
      attributes: { type: [AttributeDefSchema], default: [] },
      version: { type: Number, required: true },
    },
    { timestamps: true, collection: 'category_attribute_schemas' },
  );
