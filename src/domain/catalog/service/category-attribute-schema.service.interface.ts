import { ICategoryAttributeSchema } from '../entity/interfaces/category-attribute-schema.interface';
import { IAttributeDef } from '../entity/interfaces/category-attribute-schema.interface';
import { ICategoryRepositoryRead } from '../repository/category.repository.read';
import { ICategoryAttributeSchemaRepositoryRead } from '../repository/category-attribute-schema.repository.read';
import { ICategoryAttributeSchemaRepositoryWrite } from '../repository/category-attribute-schema.repository.write';

export interface IParamsUpsertCategoryAttributeSchema {
  id?: string;
  attributes: IAttributeDef[];
}

export interface IParamsCategoryAttributeSchemaService {
  categoryAttributeSchemaRepositoryRead: ICategoryAttributeSchemaRepositoryRead;
  categoryAttributeSchemaRepositoryWrite: ICategoryAttributeSchemaRepositoryWrite;
  categoryRepositoryRead: ICategoryRepositoryRead;
}

export interface ICategoryAttributeSchemaService {
  getByCategoryId(categoryId: string): Promise<ICategoryAttributeSchema>;
  upsertByCategoryId(
    categoryId: string,
    params: IParamsUpsertCategoryAttributeSchema,
  ): Promise<ICategoryAttributeSchema>;
}
