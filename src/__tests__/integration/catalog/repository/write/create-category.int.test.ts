import { CategoryRepositoryWrite } from '../../../../../infraestructure/repository/catalog/category.repository.write';
import { CategoryModel } from '../../../../../infraestructure/db/mongo/models/category.model';
import { ECategoryStatus } from '../../../../../domain/catalog/entity/enums/ECategoryStatus';
import { EErrorCode } from '../../../../../domain/common/errors/enums/EErrorCode';
import { validCategoryMock } from '../../../../__mocks__/category.mock';

const repositoryWrite = new CategoryRepositoryWrite();

afterEach(() => {
  jest.restoreAllMocks();
});

describe('when we create a category via repository', () => {
  it('should return the created category as a domain object', async () => {
    const category = validCategoryMock({ synonyms: [] });

    const created = await repositoryWrite.createCategory(category);

    expect(created).toMatchObject({
      id: category.id,
      slug: category.slug,
      name: category.name,
    });
    expect(created.createdAt).toBeDefined();
  });
});

describe('when we update a category by id via repository', () => {
  it('should return the updated category when it exists', async () => {
    const category = validCategoryMock({ synonyms: [] });
    await CategoryModel.create(category);

    const updated = await repositoryWrite.updateCategoryById(category.id, {
      name: 'Updated Name',
      status: ECategoryStatus.INACTIVE,
    });

    expect(updated).toMatchObject({
      id: category.id,
      name: 'Updated Name',
      status: ECategoryStatus.INACTIVE,
    });
  });

  it('should return null when the category does not exist', async () => {
    const updated = await repositoryWrite.updateCategoryById('missing-id', {
      name: 'Nope',
    });
    expect(updated).toBeNull();
  });
});

describe('when CategoryModel.create rejects for createCategory', () => {
  it('should reject with DATABASE_ERROR', async () => {
    jest
      .spyOn(CategoryModel, 'create')
      .mockRejectedValue(new Error('mongo failure'));

    await expect(
      repositoryWrite.createCategory(validCategoryMock({ synonyms: [] })),
    ).rejects.toMatchObject({
      status: 500,
      errorCode: EErrorCode.DATABASE_ERROR,
    });
  });
});
