import { EAttributeType } from './enums/EAttributeType';
import {
  IAttributeDef,
  ICategoryAttributeSchema,
} from './interfaces/category-attribute-schema.interface';

export class CategoryAttributeSchemaServiceEntity
  implements ICategoryAttributeSchema
{
  id: string;
  categoryId: string;
  attributes: IAttributeDef[];
  version: number;
  createdAt: Date;
  updatedAt?: Date;

  constructor(schema: ICategoryAttributeSchema) {
    this.validate(schema);
    this.id = schema.id;
    this.categoryId = schema.categoryId;
    this.attributes = schema.attributes.map((attr) => this.normalizeAttr(attr));
    this.version = schema.version;
    this.createdAt = schema.createdAt || new Date();
    this.updatedAt = schema.updatedAt;
  }

  private normalizeAttr(attr: IAttributeDef): IAttributeDef {
    return {
      ...attr,
      key: attr.key.trim(),
      name: attr.name.trim(),
      unit: attr.unit?.trim(),
      group: attr.group?.trim(),
      enumValues: attr.enumValues?.map((v) => v.trim()).filter(Boolean),
    };
  }

  private validate(schema: ICategoryAttributeSchema): void {
    if (!schema.id?.trim()) {
      throw new Error('id is required');
    }
    if (!schema.categoryId?.trim()) {
      throw new Error('categoryId is required');
    }
    if (!Number.isInteger(schema.version) || schema.version < 1) {
      throw new Error('version must be an integer >= 1');
    }
    if (!Array.isArray(schema.attributes)) {
      throw new Error('attributes must be an array');
    }

    const keys = new Set<string>();
    for (const attr of schema.attributes) {
      if (!attr.key?.trim()) {
        throw new Error('attribute key is required');
      }
      if (!attr.name?.trim()) {
        throw new Error('attribute name is required');
      }
      const key = attr.key.trim();
      if (keys.has(key)) {
        throw new Error(`attribute key must be unique: ${key}`);
      }
      keys.add(key);

      if (attr.valueType === EAttributeType.ENUM) {
        if (!attr.enumValues || attr.enumValues.length === 0) {
          throw new Error(`ENUM attribute ${key} requires enumValues`);
        }
      }
    }
  }
}
