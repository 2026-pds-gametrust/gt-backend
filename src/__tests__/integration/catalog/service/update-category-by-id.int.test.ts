import { Types } from 'mongoose';
import { CategoryServiceFactory } from '../../../../configuration/factory/category.service.factory';
import { CategoryService } from '../../../../domain/catalog/service/category.service';
import { ECategoryStatus } from '../../../../domain/catalog/entity/enums/ECategoryStatus';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { CategoryModel } from '../../../../infraestructure/db/mongo/models/category.model';
import { CategoryRepositoryRead } from '../../../../infraestructure/repository/catalog/category.repository.read';
import { CategoryRepositoryWrite } from '../../../../infraestructure/repository/catalog/category.repository.write';
import { ServiceTaxonomyRepositoryRead } from '../../../../infraestructure/repository/catalog/service-taxonomy.repository.read';
import { validCategoryMock } from '../../../__mocks__/category.mock';

const categoryService = CategoryServiceFactory.create();

describe('when we update a category by id', () => {
  it('should return the updated category with normalized synonyms', async () => {
    const category = validCategoryMock({ synonyms: ['gpu'] });
    await CategoryModel.create(category);

    const result = await categoryService.updateCategoryById(category.id, {
      categoryData: {
        name: '  Updated GPUs  ',
        synonyms: ['  Placa   De Video '],
        status: ECategoryStatus.INACTIVE,
      },
    });

    expect(result).toMatchObject({
      id: category.id,
      slug: category.slug,
      name: 'Updated GPUs',
      synonyms: ['placa de video'],
      status: ECategoryStatus.INACTIVE,
    });
  });
});

describe('when we update a missing category', () => {
  it('should reject with RESOURCE_NOT_FOUND', async () => {
    await expect(
      categoryService.updateCategoryById('missing-id', {
        categoryData: { name: 'Anything' },
      }),
    ).rejects.toMatchObject({
      status: 404,
      errorCode: EErrorCode.RESOURCE_NOT_FOUND,
    });
  });
});

describe('when we update a category name to one already used', () => {
  it('should reject with RESOURCE_CONFLICT', async () => {
    const first = validCategoryMock({
      id: new Types.ObjectId().toHexString(),
      slug: `first-${Date.now()}`,
      name: `First ${Date.now()}`,
      synonyms: [],
    });
    const second = validCategoryMock({
      id: new Types.ObjectId().toHexString(),
      slug: `second-${Date.now()}`,
      name: `Second ${Date.now()}`,
      synonyms: [],
    });
    await CategoryModel.create(first);
    await CategoryModel.create(second);

    await expect(
      categoryService.updateCategoryById(second.id, {
        categoryData: { name: first.name },
      }),
    ).rejects.toMatchObject({
      status: 409,
      errorCode: EErrorCode.RESOURCE_CONFLICT,
      details: { name: first.name },
    });
  });
});

describe('when we update a category with a synonym already used', () => {
  it('should reject with RESOURCE_CONFLICT', async () => {
    await CategoryModel.create(
      validCategoryMock({
        id: new Types.ObjectId().toHexString(),
        slug: `other-${Date.now()}`,
        name: `Other ${Date.now()}`,
        synonyms: ['placa de video'],
      }),
    );
    const target = validCategoryMock({
      synonyms: ['gpu'],
    });
    await CategoryModel.create(target);

    await expect(
      categoryService.updateCategoryById(target.id, {
        categoryData: { synonyms: ['Placa De Video'] },
      }),
    ).rejects.toMatchObject({
      status: 409,
      errorCode: EErrorCode.RESOURCE_CONFLICT,
      details: { synonym: 'placa de video' },
    });
  });
});

describe('when we update a category successfully', () => {
  it('should publish catalog.category.updated via event publisher', async () => {
    const publisher = {
      publish: jest.fn().mockResolvedValue(undefined),
    };
    const service = new CategoryService({
      categoryRepositoryRead: new CategoryRepositoryRead(),
      categoryRepositoryWrite: new CategoryRepositoryWrite(),
      serviceTaxonomyRepositoryRead: new ServiceTaxonomyRepositoryRead(),
      eventPublisher: publisher,
    });

    const category = validCategoryMock({ synonyms: [] });
    await CategoryModel.create(category);

    await service.updateCategoryById(category.id, {
      categoryData: { name: `Renamed ${Date.now()}` },
    });

    expect(publisher.publish).toHaveBeenCalledTimes(1);
    expect(publisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'catalog.category.updated',
        aggregateId: category.id,
        producerModule: 'catalog',
      }),
    );
  });
});
