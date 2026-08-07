import { Types } from 'mongoose';
import { FavoriteServiceFactory } from '../../../../configuration/factory/favorite.service.factory';
import { EFavoriteTargetType } from '../../../../domain/favorites/entity/enums/EFavoriteTargetType';
import { FavoriteModel } from '../../../../infraestructure/db/mongo/models/favorite.model';
import { validFavoriteMock } from '../../../__mocks__/search-favorites.mock';

const favoriteService = FavoriteServiceFactory.create();

describe('when we list favorites by user id', () => {
  it('should return only favorites for that user', async () => {
    const userId = new Types.ObjectId().toHexString();
    const otherUserId = new Types.ObjectId().toHexString();

    const owned = validFavoriteMock({
      userId,
      targetType: EFavoriteTargetType.PRODUCT,
    });
    const other = validFavoriteMock({
      userId: otherUserId,
      targetType: EFavoriteTargetType.LISTING,
    });
    await FavoriteModel.create(owned);
    await FavoriteModel.create(other);

    const result = await favoriteService.listByUserId(userId);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: owned.id,
      userId,
      targetId: owned.targetId,
    });
  });

  it('should return an empty list when the user has no favorites', async () => {
    const result = await favoriteService.listByUserId(
      new Types.ObjectId().toHexString(),
    );
    expect(result).toEqual([]);
  });
});
