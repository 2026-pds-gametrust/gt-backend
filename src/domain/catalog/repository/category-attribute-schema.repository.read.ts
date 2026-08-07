import { ICategoryAttributeSchema } from '../entity/interfaces/category-attribute-schema.interface';

export interface ICategoryAttributeSchemaRepositoryRead {
  findById(id: string): Promise<ICategoryAttributeSchema | null>;
  findByCategoryId(
    categoryId: string,
  ): Promise<ICategoryAttributeSchema | null>;
}
