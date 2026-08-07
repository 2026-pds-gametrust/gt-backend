import { ICategory } from '../../../../domain/catalog/entity/interfaces/category.interface';
import { IMCategory } from '../../../db/mongo/models/category.model';

export function dbToInternal(category: IMCategory): ICategory {
  return {
    id: category.id,
    slug: category.slug,
    name: category.name,
    synonyms: category.synonyms ?? [],
    parentId: category.parentId ?? null,
    status: category.status,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}

export function internalToDb(
  category: ICategory,
): Omit<IMCategory, '_id' | 'createdAt' | 'updatedAt'> {
  return {
    id: category.id,
    slug: category.slug,
    name: category.name,
    synonyms: category.synonyms,
    parentId: category.parentId,
    status: category.status,
  };
}
