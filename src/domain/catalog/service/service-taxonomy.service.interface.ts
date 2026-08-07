import { IEventPublisher } from '../../common/messaging/event-publisher.interface';
import { EServiceTaxonomyStatus } from '../entity/enums/EServiceTaxonomyStatus';
import { IServiceTaxonomy } from '../entity/interfaces/service-taxonomy.interface';
import { ICategoryRepositoryRead } from '../repository/category.repository.read';
import { IServiceTaxonomyRepositoryRead } from '../repository/service-taxonomy.repository.read';
import { IServiceTaxonomyRepositoryWrite } from '../repository/service-taxonomy.repository.write';

export interface IParamsCreateServiceTaxonomy {
  id: string;
  slug: string;
  name: string;
  synonyms?: string[];
  status?: EServiceTaxonomyStatus;
}

export interface IParamsUpdateServiceTaxonomy {
  serviceData: Partial<
    Pick<IServiceTaxonomy, 'name' | 'synonyms' | 'status'>
  >;
}

export interface IParamsServiceTaxonomyService {
  serviceTaxonomyRepositoryRead: IServiceTaxonomyRepositoryRead;
  serviceTaxonomyRepositoryWrite: IServiceTaxonomyRepositoryWrite;
  categoryRepositoryRead: ICategoryRepositoryRead;
  eventPublisher: IEventPublisher;
}

export interface IServiceTaxonomyService {
  createService(params: IParamsCreateServiceTaxonomy): Promise<IServiceTaxonomy>;
  getServiceById(id: string): Promise<IServiceTaxonomy>;
  listServices(filter?: Partial<IServiceTaxonomy>): Promise<IServiceTaxonomy[]>;
  updateServiceById(
    id: string,
    params: IParamsUpdateServiceTaxonomy,
  ): Promise<IServiceTaxonomy>;
}
