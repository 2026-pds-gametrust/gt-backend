import { FavoriteModel } from '../../../../infraestructure/db/mongo/models/favorite.model';
import { FavoriteRepositoryRead } from '../../../../infraestructure/repository/favorites/favorite.repository.read';
import { FavoriteRepositoryWrite } from '../../../../infraestructure/repository/favorites/favorite.repository.write';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { EFavoriteTargetType } from '../../../../domain/favorites/entity/enums/EFavoriteTargetType';
import { validFavoriteMock } from '../../../__mocks__/search-favorites.mock';

const repositoryRead = new FavoriteRepositoryRead();
const repositoryWrite = new FavoriteRepositoryWrite();

describe('when favorite repository read hits a database failure', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should throw DATABASE_ERROR on findFavoriteById', async () => {
    jest.spyOn(FavoriteModel, 'findOne').mockRejectedValueOnce(new Error('boom'));
    await expect(repositoryRead.findFavoriteById('id')).rejects.toMatchObject({
      status: 500,
      errorCode: EErrorCode.DATABASE_ERROR,
    });
  });

  it('should throw DATABASE_ERROR on findByUserTarget', async () => {
    jest.spyOn(FavoriteModel, 'findOne').mockRejectedValueOnce(new Error('boom'));
    await expect(
      repositoryRead.findByUserTarget(
        'user-1',
        EFavoriteTargetType.PRODUCT,
        'target-1',
      ),
    ).rejects.toMatchObject({
      status: 500,
      errorCode: EErrorCode.DATABASE_ERROR,
    });
  });

  it('should throw DATABASE_ERROR on listByUserId', async () => {
    jest.spyOn(FavoriteModel, 'find').mockRejectedValueOnce(new Error('boom'));
    await expect(repositoryRead.listByUserId('user-1')).rejects.toMatchObject({
      status: 500,
      errorCode: EErrorCode.DATABASE_ERROR,
    });
  });
});

describe('when favorite repository write hits a database failure', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should throw DATABASE_ERROR on createFavorite', async () => {
    jest.spyOn(FavoriteModel, 'create').mockRejectedValueOnce(new Error('boom'));
    await expect(
      repositoryWrite.createFavorite(validFavoriteMock()),
    ).rejects.toMatchObject({
      status: 500,
      errorCode: EErrorCode.DATABASE_ERROR,
    });
  });

  it('should throw DATABASE_ERROR on deleteFavoriteById', async () => {
    jest
      .spyOn(FavoriteModel, 'deleteOne')
      .mockRejectedValueOnce(new Error('boom'));
    await expect(
      repositoryWrite.deleteFavoriteById('id'),
    ).rejects.toMatchObject({
      status: 500,
      errorCode: EErrorCode.DATABASE_ERROR,
    });
  });
});
