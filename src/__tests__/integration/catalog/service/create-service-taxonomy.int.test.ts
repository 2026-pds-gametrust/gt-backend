import { Types } from 'mongoose';
import { ServiceTaxonomyServiceFactory } from '../../../../configuration/factory/service-taxonomy.service.factory';
import { ServiceTaxonomyService } from '../../../../domain/catalog/service/service-taxonomy.service';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { CategoryModel } from '../../../../infraestructure/db/mongo/models/category.model';
import { ServiceTaxonomyModel } from '../../../../infraestructure/db/mongo/models/service-taxonomy.model';
import { CategoryRepositoryRead } from '../../../../infraestructure/repository/catalog/category.repository.read';
import { ServiceTaxonomyRepositoryRead } from '../../../../infraestructure/repository/catalog/service-taxonomy.repository.read';
import { ServiceTaxonomyRepositoryWrite } from '../../../../infraestructure/repository/catalog/service-taxonomy.repository.write';
import { validCategoryMock } from '../../../__mocks__/category.mock';
import { validServiceTaxonomyMock } from '../../../__mocks__/service-taxonomy.mock';

const serviceTaxonomyService = ServiceTaxonomyServiceFactory.create();

describe('when we create a service with a unique slug', () => {
  it('should return the created service with normalized synonyms', async () => {
    const service = validServiceTaxonomyMock({
      synonyms: ['  Montar   PC '],
    });

    const result = await serviceTaxonomyService.createService(service);

    expect(result).toMatchObject({
      id: service.id,
      slug: service.slug,
      name: service.name,
      synonyms: ['montar pc'],
    });
    expect(result.createdAt).toBeDefined();
  });
});

describe('when we create a service with a duplicate slug', () => {
  it('should reject with RESOURCE_CONFLICT', async () => {
    const service = validServiceTaxonomyMock({ synonyms: [] });
    await ServiceTaxonomyModel.create(service);

    await expect(
      serviceTaxonomyService.createService(service),
    ).rejects.toMatchObject({
      status: 409,
      errorCode: EErrorCode.RESOURCE_CONFLICT,
    });
  });
});

describe('when we create a service with a synonym already used by a category', () => {
  it('should reject with RESOURCE_CONFLICT', async () => {
    await CategoryModel.create(
      validCategoryMock({
        id: new Types.ObjectId().toHexString(),
        synonyms: ['placa de video'],
      }),
    );

    await expect(
      serviceTaxonomyService.createService(
        validServiceTaxonomyMock({
          synonyms: ['Placa De Video'],
        }),
      ),
    ).rejects.toMatchObject({
      status: 409,
      errorCode: EErrorCode.RESOURCE_CONFLICT,
      details: expect.objectContaining({ synonym: 'placa de video' }),
    });
  });
});

describe('when we get a missing service', () => {
  it('should reject with RESOURCE_NOT_FOUND', async () => {
    await expect(
      serviceTaxonomyService.getServiceById('missing-id'),
    ).rejects.toMatchObject({
      status: 404,
      errorCode: EErrorCode.RESOURCE_NOT_FOUND,
    });
  });
});

describe('when we create a service', () => {
  it('should publish catalog.service.created via event publisher', async () => {
    const publisher = {
      publish: jest.fn().mockResolvedValue(undefined),
    };

    const service = new ServiceTaxonomyService({
      serviceTaxonomyRepositoryRead: new ServiceTaxonomyRepositoryRead(),
      serviceTaxonomyRepositoryWrite: new ServiceTaxonomyRepositoryWrite(),
      categoryRepositoryRead: new CategoryRepositoryRead(),
      eventPublisher: publisher,
    });

    const payload = validServiceTaxonomyMock({ synonyms: ['build'] });
    await service.createService(payload);

    expect(publisher.publish).toHaveBeenCalledTimes(1);
    expect(publisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'catalog.service.created',
        aggregateId: payload.id,
        producerModule: 'catalog',
      }),
    );
  });
});
