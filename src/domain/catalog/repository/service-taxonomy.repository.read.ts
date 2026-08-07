import { IServiceTaxonomy } from '../entity/interfaces/service-taxonomy.interface';

export interface IServiceTaxonomyRepositoryRead {
  findById(id: string): Promise<IServiceTaxonomy | null>;
  findBySlug(slug: string): Promise<IServiceTaxonomy | null>;
  findByName(name: string): Promise<IServiceTaxonomy | null>;
  findBySynonym(synonym: string): Promise<IServiceTaxonomy | null>;
  list(filter?: Partial<IServiceTaxonomy>): Promise<IServiceTaxonomy[]>;
}
