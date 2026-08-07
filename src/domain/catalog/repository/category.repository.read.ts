import { ICategory } from '../entity/interfaces/category.interface';

export interface ICategoryRepositoryRead {
  findCategoryById(id: string): Promise<ICategory | null>;
  findCategoryBySlug(slug: string): Promise<ICategory | null>;
  findCategoryByName(name: string): Promise<ICategory | null>;
  findCategoryBySynonym(synonym: string): Promise<ICategory | null>;
  listCategories(filter?: Partial<ICategory>): Promise<ICategory[]>;
}
