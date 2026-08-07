import { IServiceTaxonomy } from '../../../../domain/catalog/entity/interfaces/service-taxonomy.interface';
import { IMServiceTaxonomy } from '../../../db/mongo/models/service-taxonomy.model';

export function dbToInternal(service: IMServiceTaxonomy): IServiceTaxonomy {
  return {
    id: service.id,
    slug: service.slug,
    name: service.name,
    synonyms: service.synonyms ?? [],
    status: service.status,
    createdAt: service.createdAt,
    updatedAt: service.updatedAt,
  };
}

export function internalToDb(
  service: IServiceTaxonomy,
): Omit<IMServiceTaxonomy, '_id' | 'createdAt' | 'updatedAt'> {
  return {
    id: service.id,
    slug: service.slug,
    name: service.name,
    synonyms: service.synonyms,
    status: service.status,
  };
}
