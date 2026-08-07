import { Types } from 'mongoose';
import { EServiceTaxonomyStatus } from '../../domain/catalog/entity/enums/EServiceTaxonomyStatus';
import { IServiceTaxonomy } from '../../domain/catalog/entity/interfaces/service-taxonomy.interface';

export const validServiceTaxonomyMock = (
  override?: Partial<IServiceTaxonomy>,
): IServiceTaxonomy => ({
  id: new Types.ObjectId().toHexString(),
  slug: `montage-${Date.now()}`,
  name: `Montagem ${Date.now()}`,
  synonyms: ['montar pc'],
  status: EServiceTaxonomyStatus.ACTIVE,
  createdAt: new Date(),
  ...override,
});
