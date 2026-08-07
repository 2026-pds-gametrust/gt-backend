import { Types, model } from 'mongoose';
import { IServiceTaxonomy } from '../../../../domain/catalog/entity/interfaces/service-taxonomy.interface';
import { ServiceTaxonomySchema } from '../schema/service-taxonomy.schema';

export interface IMServiceTaxonomy extends Omit<IServiceTaxonomy, '_id'> {
  _id: Types.ObjectId;
  updatedAt: Date;
}

export const ServiceTaxonomyModel = model<IMServiceTaxonomy>(
  'ServiceTaxonomy',
  ServiceTaxonomySchema,
);
