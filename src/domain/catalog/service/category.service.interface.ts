import { IEventPublisher } from '../../common/messaging/event-publisher.interface';
import { ECategoryStatus } from '../entity/enums/ECategoryStatus';
import { ICategory } from '../entity/interfaces/category.interface';
import { ICategoryRepositoryRead } from '../repository/category.repository.read';
import { ICategoryRepositoryWrite } from '../repository/category.repository.write';
import { IServiceTaxonomyRepositoryRead } from '../repository/service-taxonomy.repository.read';

export interface IParamsCreateCategory {
  id: string;
  slug: string;
  name: string;
  synonyms?: string[];
  parentId?: string | null;
  status?: ECategoryStatus;
}

export interface IParamsUpdateCategory {
  categoryData: Partial<
    Pick<ICategory, 'name' | 'synonyms' | 'status' | 'parentId'>
  >;
}

export interface IParamsCategoryService {
  categoryRepositoryRead: ICategoryRepositoryRead;
  categoryRepositoryWrite: ICategoryRepositoryWrite;
  serviceTaxonomyRepositoryRead: IServiceTaxonomyRepositoryRead;
  eventPublisher: IEventPublisher;
}

export interface ICategoryService {
  createCategory(params: IParamsCreateCategory): Promise<ICategory>;
  getCategoryById(id: string): Promise<ICategory>;
  listCategories(filter?: Partial<ICategory>): Promise<ICategory[]>;
  updateCategoryById(
    id: string,
    params: IParamsUpdateCategory,
  ): Promise<ICategory>;
}
