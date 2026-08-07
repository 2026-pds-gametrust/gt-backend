import { normalizeSynonym } from '../../common/types/normalize-synonym';
import { EServiceTaxonomyStatus } from './enums/EServiceTaxonomyStatus';
import { IServiceTaxonomy } from './interfaces/service-taxonomy.interface';

export class ServiceTaxonomyServiceEntity implements IServiceTaxonomy {
  id: string;
  slug: string;
  name: string;
  synonyms: string[];
  status: EServiceTaxonomyStatus;
  createdAt: Date;
  updatedAt?: Date;

  constructor(data: IServiceTaxonomy) {
    if (!data.slug?.trim()) throw new Error('Slug is required');
    if (!data.name?.trim()) throw new Error('Name is required');
    this.id = data.id;
    this.slug = data.slug.trim().toLowerCase();
    this.name = data.name.trim();
    this.synonyms = (data.synonyms ?? []).map(normalizeSynonym).filter(Boolean);
    this.status = data.status ?? EServiceTaxonomyStatus.ACTIVE;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt;
  }
}
