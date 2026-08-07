import { CategoryService } from '../../../../domain/catalog/service/category.service';
import { ServiceTaxonomyService } from '../../../../domain/catalog/service/service-taxonomy.service';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { ECategoryStatus } from '../../../../domain/catalog/entity/enums/ECategoryStatus';
import { EServiceTaxonomyStatus } from '../../../../domain/catalog/entity/enums/EServiceTaxonomyStatus';
import { validCategoryMock } from '../../../__mocks__/category.mock';

describe('when creating a category without optional fields', () => {
  it('should default synonyms parentId and status', async () => {
    const created = validCategoryMock({
      synonyms: [],
      parentId: null,
      status: ECategoryStatus.ACTIVE,
    });
    const publisher = { publish: jest.fn().mockResolvedValue(undefined) };
    const service = new CategoryService({
      categoryRepositoryRead: {
        findCategoryBySlug: async () => null,
        findCategoryByName: async () => null,
        findCategoryBySynonym: async () => null,
        findCategoryById: async () => null,
        listCategories: async () => [],
      },
      categoryRepositoryWrite: {
        createCategory: async () => created,
        updateCategoryById: async () => null,
      },
      serviceTaxonomyRepositoryRead: {
        findBySynonym: async () => null,
      },
      eventPublisher: publisher,
    } as never);

    const result = await service.createCategory({
      id: created.id,
      slug: created.slug,
      name: created.name,
    });

    expect(result.id).toBe(created.id);
    expect(publisher.publish).toHaveBeenCalled();
  });
});

describe('when category update write returns null', () => {
  it('should reject with RESOURCE_NOT_FOUND', async () => {
    const existing = validCategoryMock();
    const service = new CategoryService({
      categoryRepositoryRead: {
        findCategoryById: async () => existing,
        findCategoryByName: async () => null,
        findCategoryBySynonym: async () => null,
        findCategoryBySlug: async () => null,
        listCategories: async () => [],
      },
      categoryRepositoryWrite: {
        createCategory: async () => existing,
        updateCategoryById: async () => null,
      },
      serviceTaxonomyRepositoryRead: {
        findBySynonym: async () => null,
      },
      eventPublisher: { publish: jest.fn() },
    } as never);

    await expect(
      service.updateCategoryById(existing.id, {
        categoryData: { name: 'Renamed' },
      }),
    ).rejects.toMatchObject({
      status: 404,
      errorCode: EErrorCode.RESOURCE_NOT_FOUND,
    });
  });
});

describe('when creating a category with duplicate name', () => {
  it('should reject with RESOURCE_CONFLICT', async () => {
    const existing = validCategoryMock();
    const service = new CategoryService({
      categoryRepositoryRead: {
        findCategoryBySlug: async () => null,
        findCategoryByName: async () => existing,
        findCategoryBySynonym: async () => null,
        findCategoryById: async () => null,
        listCategories: async () => [],
      },
      categoryRepositoryWrite: {
        createCategory: async () => existing,
        updateCategoryById: async () => null,
      },
      serviceTaxonomyRepositoryRead: {
        findBySynonym: async () => null,
      },
      eventPublisher: { publish: jest.fn() },
    } as never);

    await expect(
      service.createCategory({
        id: 'new-id',
        slug: 'new-slug',
        name: existing.name,
      }),
    ).rejects.toMatchObject({
      status: 409,
      errorCode: EErrorCode.RESOURCE_CONFLICT,
    });
  });
});

describe('when creating a service taxonomy without optional fields', () => {
  it('should default synonyms and status', async () => {
    const created = {
      id: 'svc-1',
      slug: 'boost',
      name: 'Boost',
      synonyms: [],
      status: EServiceTaxonomyStatus.ACTIVE,
      createdAt: new Date(),
    };
    const publisher = { publish: jest.fn().mockResolvedValue(undefined) };
    const service = new ServiceTaxonomyService({
      serviceTaxonomyRepositoryRead: {
        findBySlug: async () => null,
        findByName: async () => null,
        findBySynonym: async () => null,
        findById: async () => null,
        list: async () => [],
      },
      serviceTaxonomyRepositoryWrite: {
        create: async () => created,
        updateById: async () => null,
      },
      categoryRepositoryRead: {
        findCategoryBySynonym: async () => null,
      },
      eventPublisher: publisher,
    } as never);

    const result = await service.createService({
      id: created.id,
      slug: created.slug,
      name: created.name,
    });

    expect(result.id).toBe(created.id);
    expect(publisher.publish).toHaveBeenCalled();
  });
});

describe('when service taxonomy update write returns null', () => {
  it('should reject with RESOURCE_NOT_FOUND', async () => {
    const existing = {
      id: 'svc-1',
      slug: 'boost',
      name: 'Boost',
      synonyms: [],
      status: EServiceTaxonomyStatus.ACTIVE,
      createdAt: new Date(),
    };
    const service = new ServiceTaxonomyService({
      serviceTaxonomyRepositoryRead: {
        findById: async () => existing,
        findByName: async () => null,
        findBySynonym: async () => null,
        findBySlug: async () => null,
        list: async () => [],
      },
      serviceTaxonomyRepositoryWrite: {
        create: async () => existing,
        updateById: async () => null,
      },
      categoryRepositoryRead: {
        findCategoryBySynonym: async () => null,
      },
      eventPublisher: { publish: jest.fn() },
    } as never);

    await expect(
      service.updateServiceById(existing.id, {
        serviceData: { name: 'Renamed' },
      }),
    ).rejects.toMatchObject({
      status: 404,
      errorCode: EErrorCode.RESOURCE_NOT_FOUND,
    });
  });
});

describe('when creating a service taxonomy with duplicate name', () => {
  it('should reject with RESOURCE_CONFLICT', async () => {
    const existing = {
      id: 'svc-1',
      slug: 'boost',
      name: 'Boost',
      synonyms: [],
      status: EServiceTaxonomyStatus.ACTIVE,
      createdAt: new Date(),
    };
    const service = new ServiceTaxonomyService({
      serviceTaxonomyRepositoryRead: {
        findBySlug: async () => null,
        findByName: async () => existing,
        findBySynonym: async () => null,
        findById: async () => null,
        list: async () => [],
      },
      serviceTaxonomyRepositoryWrite: {
        create: async () => existing,
        updateById: async () => null,
      },
      categoryRepositoryRead: {
        findCategoryBySynonym: async () => null,
      },
      eventPublisher: { publish: jest.fn() },
    } as never);

    await expect(
      service.createService({
        id: 'new',
        slug: 'new-slug',
        name: 'Boost',
      }),
    ).rejects.toMatchObject({
      status: 409,
      errorCode: EErrorCode.RESOURCE_CONFLICT,
    });
  });
});
