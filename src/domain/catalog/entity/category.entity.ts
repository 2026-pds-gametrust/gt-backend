import { normalizeSynonym } from '../../common/types/normalize-synonym';
import { ECategoryStatus } from './enums/ECategoryStatus';
import { ICategory } from './interfaces/category.interface';

export class CategoryServiceEntity implements ICategory {
  id: string;
  slug: string;
  name: string;
  synonyms: string[];
  parentId: string | null;
  status: ECategoryStatus;
  createdAt: Date;
  updatedAt?: Date;

  constructor(category: ICategory) {
    this.validate(category);
    this.id = category.id;
    this.slug = category.slug.trim().toLowerCase();
    this.name = category.name.trim();
    this.synonyms = (category.synonyms ?? []).map(normalizeSynonym).filter(Boolean);
    this.parentId = category.parentId ?? null;
    this.status = category.status ?? ECategoryStatus.ACTIVE;
    this.createdAt = category.createdAt || new Date();
    this.updatedAt = category.updatedAt;
  }

  private validate(category: ICategory): void {
    if (!category.slug?.trim()) {
      throw new Error('Slug is required');
    }
    if (!category.name?.trim()) {
      throw new Error('Name is required');
    }
  }
}
