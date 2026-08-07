import { EServiceTaxonomyStatus } from '../enums/EServiceTaxonomyStatus';

export interface IServiceTaxonomy {
  id: string;
  slug: string;
  name: string;
  synonyms: string[];
  status: EServiceTaxonomyStatus;
  createdAt: Date;
  updatedAt?: Date;
}
