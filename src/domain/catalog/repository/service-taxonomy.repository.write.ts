import { IServiceTaxonomy } from '../entity/interfaces/service-taxonomy.interface';

export interface IServiceTaxonomyRepositoryWrite {
  create(data: IServiceTaxonomy): Promise<IServiceTaxonomy>;
  updateById(
    id: string,
    data: Partial<IServiceTaxonomy>,
  ): Promise<IServiceTaxonomy | null>;
}
