import { EAttributeFacetOn } from '../enums/EAttributeFacetOn';
import { EAttributeType } from '../enums/EAttributeType';

export interface IAttributeDef {
  key: string;
  name: string;
  valueType: EAttributeType;
  required: boolean;
  filterable: boolean;
  facetOn: EAttributeFacetOn;
  enumValues?: string[];
  unit?: string;
  maxLength?: number;
  allowVariations?: boolean;
  group?: string;
}

export interface ICategoryAttributeSchema {
  id: string;
  categoryId: string;
  attributes: IAttributeDef[];
  version: number;
  createdAt: Date;
  updatedAt?: Date;
}
