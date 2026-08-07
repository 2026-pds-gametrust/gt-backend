import { Types } from 'mongoose';
import { FavoriteServiceFactory } from '../../../../configuration/factory/favorite.service.factory';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { EFavoriteTargetType } from '../../../../domain/favorites/entity/enums/EFavoriteTargetType';
import { FavoriteModel } from '../../../../infraestructure/db/mongo/models/favorite.model';
import { sellerActor } from '../../../__mocks__/actor.mock';
import { validFavoriteMock } from '../../../__mocks__/search-favorites.mock';

const favoriteService = FavoriteServiceFactory.create();

describe('when we delete an existing favorite by id', () => {
  it('should remove the favorite for its owner', async () => {
    const favorite = validFavoriteMock({
      targetType: EFavoriteTargetType.PRODUCT,
    });
    await FavoriteModel.create(favorite);

    await favoriteService.deleteFavoriteById(
      favorite.id,
      sellerActor(favorite.userId),
    );

    const persisted = await FavoriteModel.findOne({ id: favorite.id });
    expect(persisted).toBeNull();
  });
});

describe('when we delete a missing favorite by id', () => {
  it('should reject with RESOURCE_NOT_FOUND', async () => {
    const missingId = new Types.ObjectId().toHexString();

    await expect(
      favoriteService.deleteFavoriteById(
        missingId,
        sellerActor(new Types.ObjectId().toHexString()),
      ),
    ).rejects.toMatchObject({
      status: 404,
      errorCode: EErrorCode.RESOURCE_NOT_FOUND,
      message: 'Favorite not found',
    });
  });
});
