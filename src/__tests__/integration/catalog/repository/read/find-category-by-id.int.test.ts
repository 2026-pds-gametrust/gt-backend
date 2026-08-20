import { CategoryRepositoryRead } from '../../../../../infraestructure/repository/catalog/category.repository.read';
import { CategoryModel } from '../../../../../infraestructure/db/mongo/models/category.model';
import { EErrorCode } from '../../../../../domain/common/errors/enums/EErrorCode';
import { validCategoryMock } from '../../../../__mocks__/category.mock';

const repositoryRead = new CategoryRepositoryRead();

afterEach(() => {
  jest.restoreAllMocks();
});

describe('when we find a category by id via repository', () => {
  it('should return the category when it exists', async () => {
    const category = validCategoryMock({ synonyms: [] });
    await CategoryModel.create(category);

    const found = await repositoryRead.findCategoryById(category.id);

    expect(found).toMatchObject({
      id: category.id,
      slug: category.slug,
      name: category.name,
    });
  });

  it('should return null when the category does not exist', async () => {
    const found = await repositoryRead.findCategoryById('nonexistent-id');
    expect(found).toBeNull();
  });
});

describe('when CategoryModel.findOne rejects for findCategoryById', () => {
  it('should reject with DATABASE_ERROR', async () => {
    jest
      .spyOn(CategoryModel, 'findOne')
      .mockRejectedValue(new Error('mongo failure'));

    await expect(
      repositoryRead.findCategoryById('any-id'),
    ).rejects.toMatchObject({
      status: 500,
      errorCode: EErrorCode.DATABASE_ERROR,
    });
  });
});
