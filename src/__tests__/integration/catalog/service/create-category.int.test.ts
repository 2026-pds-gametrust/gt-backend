import { Types } from 'mongoose';
import { CategoryServiceFactory } from '../../../../configuration/factory/category.service.factory';
import { CategoryService } from '../../../../domain/catalog/service/category.service';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { CategoryModel } from '../../../../infraestructure/db/mongo/models/category.model';
import { CategoryRepositoryRead } from '../../../../infraestructure/repository/catalog/category.repository.read';
import { CategoryRepositoryWrite } from '../../../../infraestructure/repository/catalog/category.repository.write';
import { ServiceTaxonomyRepositoryRead } from '../../../../infraestructure/repository/catalog/service-taxonomy.repository.read';
import { validCategoryMock } from '../../../__mocks__/category.mock';

const categoryService = CategoryServiceFactory.create();

describe('when we create a category with a unique slug', () => {
  it('should return the created category', async () => {
    const category = validCategoryMock({
      synonyms: ['  Placa   De Video '],
    });

    const result = await categoryService.createCategory(category);

    expect(result).toMatchObject({
      id: category.id,
      slug: category.slug,
      name: category.name,
      synonyms: ['placa de video'],
    });
    expect(result.createdAt).toBeDefined();
  });
});

describe('when we create a category with a duplicate slug', () => {
  it('should reject with RESOURCE_CONFLICT', async () => {
    const category = validCategoryMock({ synonyms: [] });
    await CategoryModel.create(category);

    await expect(categoryService.createCategory(category)).rejects.toMatchObject(
      {
        status: 409,
        errorCode: EErrorCode.RESOURCE_CONFLICT,
      },
    );
  });
});

describe('when we create a category with a synonym already used', () => {
  it('should reject with RESOURCE_CONFLICT', async () => {
    await CategoryModel.create(
      validCategoryMock({
        id: new Types.ObjectId().toHexString(),
        slug: `other-${Date.now()}`,
        name: `Other ${Date.now()}`,
        synonyms: ['placa de video'],
      }),
    );

    await expect(
      categoryService.createCategory(
        validCategoryMock({
          synonyms: ['Placa De Video'],
        }),
      ),
    ).rejects.toMatchObject({
      status: 409,
      errorCode: EErrorCode.RESOURCE_CONFLICT,
      details: { synonym: 'placa de video' },
    });
  });
});

describe('when we get a missing category', () => {
  it('should reject with RESOURCE_NOT_FOUND', async () => {
    await expect(
      categoryService.getCategoryById('missing-id'),
    ).rejects.toMatchObject({
      status: 404,
      errorCode: EErrorCode.RESOURCE_NOT_FOUND,
    });
  });
});

describe('when we create a category', () => {
  it('should publish catalog.category.created via event publisher', async () => {
    const publisher = {
      publish: jest.fn().mockResolvedValue(undefined),
    };

    const service = new CategoryService({
      categoryRepositoryRead: new CategoryRepositoryRead(),
      categoryRepositoryWrite: new CategoryRepositoryWrite(),
      serviceTaxonomyRepositoryRead: new ServiceTaxonomyRepositoryRead(),
      eventPublisher: publisher,
    });

    const category = validCategoryMock({ synonyms: ['vga'] });
    await service.createCategory(category);

    expect(publisher.publish).toHaveBeenCalledTimes(1);
    expect(publisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'catalog.category.created',
        aggregateId: category.id,
        producerModule: 'catalog',
      }),
    );
  });
});
