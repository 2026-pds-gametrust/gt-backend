import { Types } from 'mongoose';
import { CategoryServiceFactory } from '../../../../configuration/factory/category.service.factory';
import { ECategoryStatus } from '../../../../domain/catalog/entity/enums/ECategoryStatus';
import { CategoryModel } from '../../../../infraestructure/db/mongo/models/category.model';
import { validCategoryMock } from '../../../__mocks__/category.mock';

const categoryService = CategoryServiceFactory.create();

describe('when we list categories with a status filter', () => {
  it('should return only categories matching the filter', async () => {
    const active = validCategoryMock({
      id: new Types.ObjectId().toHexString(),
      slug: `active-${Date.now()}`,
      name: `Active ${Date.now()}`,
      status: ECategoryStatus.ACTIVE,
      synonyms: [],
    });
    const inactive = validCategoryMock({
      id: new Types.ObjectId().toHexString(),
      slug: `inactive-${Date.now()}`,
      name: `Inactive ${Date.now()}`,
      status: ECategoryStatus.INACTIVE,
      synonyms: [],
    });
    await CategoryModel.create(active);
    await CategoryModel.create(inactive);

    const result = await categoryService.listCategories({
      status: ECategoryStatus.ACTIVE,
    });

    expect(result.some((c) => c.id === active.id)).toBe(true);
    expect(result.every((c) => c.status === ECategoryStatus.ACTIVE)).toBe(true);
    expect(result.some((c) => c.id === inactive.id)).toBe(false);
  });
});

describe('when we list categories and none match the filter', () => {
  it('should return an empty array', async () => {
    const result = await categoryService.listCategories({
      slug: `missing-slug-${Date.now()}`,
    });

    expect(result).toEqual([]);
  });
});
