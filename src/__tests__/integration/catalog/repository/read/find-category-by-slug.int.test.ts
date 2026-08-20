import { CategoryRepositoryRead } from '../../../../../infraestructure/repository/catalog/category.repository.read';
import { CategoryModel } from '../../../../../infraestructure/db/mongo/models/category.model';
import { EErrorCode } from '../../../../../domain/common/errors/enums/EErrorCode';
import { validCategoryMock } from '../../../../__mocks__/category.mock';

const repositoryRead = new CategoryRepositoryRead();

afterEach(() => {
  jest.restoreAllMocks();
});

describe('when we find a category by slug via repository', () => {
  it('should return the category when it exists', async () => {
    const category = validCategoryMock({ synonyms: [] });
    await CategoryModel.create(category);

    const found = await repositoryRead.findCategoryBySlug(category.slug);

    expect(found).toMatchObject({
      id: category.id,
      slug: category.slug,
    });
  });

  it('should return null when the slug does not exist', async () => {
    const found = await repositoryRead.findCategoryBySlug(
      `missing-slug-${Date.now()}`,
    );
    expect(found).toBeNull();
  });
});

describe('when CategoryModel.findOne rejects for findCategoryBySlug', () => {
  it('should reject with DATABASE_ERROR', async () => {
    jest
      .spyOn(CategoryModel, 'findOne')
      .mockRejectedValue(new Error('mongo failure'));

    await expect(
      repositoryRead.findCategoryBySlug('any-slug'),
    ).rejects.toMatchObject({
      status: 500,
      errorCode: EErrorCode.DATABASE_ERROR,
    });
  });
});
