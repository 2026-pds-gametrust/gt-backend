import { Types } from 'mongoose';
import { ServiceTaxonomyServiceFactory } from '../../../../configuration/factory/service-taxonomy.service.factory';
import { ServiceTaxonomyService } from '../../../../domain/catalog/service/service-taxonomy.service';
import { EServiceTaxonomyStatus } from '../../../../domain/catalog/entity/enums/EServiceTaxonomyStatus';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { CategoryModel } from '../../../../infraestructure/db/mongo/models/category.model';
import { ServiceTaxonomyModel } from '../../../../infraestructure/db/mongo/models/service-taxonomy.model';
import { CategoryRepositoryRead } from '../../../../infraestructure/repository/catalog/category.repository.read';
import { ServiceTaxonomyRepositoryRead } from '../../../../infraestructure/repository/catalog/service-taxonomy.repository.read';
import { ServiceTaxonomyRepositoryWrite } from '../../../../infraestructure/repository/catalog/service-taxonomy.repository.write';
import { validCategoryMock } from '../../../__mocks__/category.mock';
import { validServiceTaxonomyMock } from '../../../__mocks__/service-taxonomy.mock';

const serviceTaxonomyService = ServiceTaxonomyServiceFactory.create();

describe('when we update a service by id', () => {
  it('should return the updated service with normalized synonyms', async () => {
    const service = validServiceTaxonomyMock({ synonyms: ['build'] });
    await ServiceTaxonomyModel.create(service);

    const result = await serviceTaxonomyService.updateServiceById(service.id, {
      serviceData: {
        name: '  Updated Montagem  ',
        synonyms: ['  Montar   PC '],
        status: EServiceTaxonomyStatus.INACTIVE,
      },
    });

    expect(result).toMatchObject({
      id: service.id,
      slug: service.slug,
      name: 'Updated Montagem',
      synonyms: ['montar pc'],
      status: EServiceTaxonomyStatus.INACTIVE,
    });
  });
});

describe('when we update a missing service', () => {
  it('should reject with RESOURCE_NOT_FOUND', async () => {
    await expect(
      serviceTaxonomyService.updateServiceById('missing-id', {
        serviceData: { name: 'Anything' },
      }),
    ).rejects.toMatchObject({
      status: 404,
      errorCode: EErrorCode.RESOURCE_NOT_FOUND,
    });
  });
});

describe('when we update a service name to one already used', () => {
  it('should reject with RESOURCE_CONFLICT', async () => {
    const first = validServiceTaxonomyMock({
      id: new Types.ObjectId().toHexString(),
      slug: `first-svc-${Date.now()}`,
      name: `First Svc ${Date.now()}`,
      synonyms: [],
    });
    const second = validServiceTaxonomyMock({
      id: new Types.ObjectId().toHexString(),
      slug: `second-svc-${Date.now()}`,
      name: `Second Svc ${Date.now()}`,
      synonyms: [],
    });
    await ServiceTaxonomyModel.create(first);
    await ServiceTaxonomyModel.create(second);

    await expect(
      serviceTaxonomyService.updateServiceById(second.id, {
        serviceData: { name: first.name },
      }),
    ).rejects.toMatchObject({
      status: 409,
      errorCode: EErrorCode.RESOURCE_CONFLICT,
      details: { name: first.name },
    });
  });
});

describe('when we update a service with a synonym already used by a category', () => {
  it('should reject with RESOURCE_CONFLICT', async () => {
    await CategoryModel.create(
      validCategoryMock({
        id: new Types.ObjectId().toHexString(),
        synonyms: ['placa de video'],
      }),
    );
    const target = validServiceTaxonomyMock({ synonyms: ['build'] });
    await ServiceTaxonomyModel.create(target);

    await expect(
      serviceTaxonomyService.updateServiceById(target.id, {
        serviceData: { synonyms: ['Placa De Video'] },
      }),
    ).rejects.toMatchObject({
      status: 409,
      errorCode: EErrorCode.RESOURCE_CONFLICT,
      details: expect.objectContaining({ synonym: 'placa de video' }),
    });
  });
});

describe('when we update a service successfully', () => {
  it('should publish catalog.service.updated via event publisher', async () => {
    const publisher = {
      publish: jest.fn().mockResolvedValue(undefined),
    };
    const service = new ServiceTaxonomyService({
      serviceTaxonomyRepositoryRead: new ServiceTaxonomyRepositoryRead(),
      serviceTaxonomyRepositoryWrite: new ServiceTaxonomyRepositoryWrite(),
      categoryRepositoryRead: new CategoryRepositoryRead(),
      eventPublisher: publisher,
    });

    const payload = validServiceTaxonomyMock({ synonyms: [] });
    await ServiceTaxonomyModel.create(payload);

    await service.updateServiceById(payload.id, {
      serviceData: { name: `Renamed Svc ${Date.now()}` },
    });

    expect(publisher.publish).toHaveBeenCalledTimes(1);
    expect(publisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'catalog.service.updated',
        aggregateId: payload.id,
        producerModule: 'catalog',
      }),
    );
  });
});
