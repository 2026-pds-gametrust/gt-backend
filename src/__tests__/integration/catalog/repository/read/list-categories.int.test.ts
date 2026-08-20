import { CategoryRepositoryRead } from '../../../../../infraestructure/repository/catalog/category.repository.read';
import { CategoryModel } from '../../../../../infraestructure/db/mongo/models/category.model';
import { ECategoryStatus } from '../../../../../domain/catalog/entity/enums/ECategoryStatus';
import { validCategoryMock } from '../../../../__mocks__/category.mock';

const repositoryRead = new CategoryRepositoryRead();

describe('when we list categories via repository', () => {
  it('should return categories matching the provided filter', async () => {
    const category = validCategoryMock({
      synonyms: [],
      status: ECategoryStatus.ACTIVE,
    });
    await CategoryModel.create(category);

    const categories = await repositoryRead.listCategories({
      slug: category.slug,
    });

    expect(categories.length).toBeGreaterThanOrEqual(1);
    expect(categories.some((c) => c.id === category.id)).toBe(true);
  });
});
