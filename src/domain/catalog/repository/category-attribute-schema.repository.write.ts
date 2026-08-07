import { ICategoryAttributeSchema } from '../entity/interfaces/category-attribute-schema.interface';

export interface ICategoryAttributeSchemaRepositoryWrite {
  createSchema(
    schema: ICategoryAttributeSchema,
  ): Promise<ICategoryAttributeSchema>;
  updateSchemaById(
    id: string,
    data: Partial<ICategoryAttributeSchema>,
  ): Promise<ICategoryAttributeSchema | null>;
}
