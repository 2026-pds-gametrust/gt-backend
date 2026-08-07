import { ICategory } from '../entity/interfaces/category.interface';

export interface ICategoryRepositoryWrite {
  createCategory(category: ICategory): Promise<ICategory>;
  updateCategoryById(
    id: string,
    data: Partial<ICategory>,
  ): Promise<ICategory | null>;
}
