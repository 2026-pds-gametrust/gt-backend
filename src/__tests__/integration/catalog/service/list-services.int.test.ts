import { Types } from 'mongoose';
import { ServiceTaxonomyServiceFactory } from '../../../../configuration/factory/service-taxonomy.service.factory';
import { EServiceTaxonomyStatus } from '../../../../domain/catalog/entity/enums/EServiceTaxonomyStatus';
import { ServiceTaxonomyModel } from '../../../../infraestructure/db/mongo/models/service-taxonomy.model';
import { validServiceTaxonomyMock } from '../../../__mocks__/service-taxonomy.mock';

const serviceTaxonomyService = ServiceTaxonomyServiceFactory.create();

describe('when we list services with a status filter', () => {
  it('should return only services matching the filter', async () => {
    const active = validServiceTaxonomyMock({
      id: new Types.ObjectId().toHexString(),
      slug: `active-svc-${Date.now()}`,
      name: `Active Svc ${Date.now()}`,
      status: EServiceTaxonomyStatus.ACTIVE,
      synonyms: [],
    });
    const inactive = validServiceTaxonomyMock({
      id: new Types.ObjectId().toHexString(),
      slug: `inactive-svc-${Date.now()}`,
      name: `Inactive Svc ${Date.now()}`,
      status: EServiceTaxonomyStatus.INACTIVE,
      synonyms: [],
    });
    await ServiceTaxonomyModel.create(active);
    await ServiceTaxonomyModel.create(inactive);

    const result = await serviceTaxonomyService.listServices({
      status: EServiceTaxonomyStatus.ACTIVE,
    });

    expect(result.some((s) => s.id === active.id)).toBe(true);
    expect(
      result.every((s) => s.status === EServiceTaxonomyStatus.ACTIVE),
    ).toBe(true);
    expect(result.some((s) => s.id === inactive.id)).toBe(false);
  });
});

describe('when we list services and none match the filter', () => {
  it('should return an empty array', async () => {
    const result = await serviceTaxonomyService.listServices({
      slug: `missing-service-${Date.now()}`,
    });

    expect(result).toEqual([]);
  });
});
