import { Types } from 'mongoose';
import { FavoriteServiceFactory } from '../../../../configuration/factory/favorite.service.factory';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { EFavoriteTargetType } from '../../../../domain/favorites/entity/enums/EFavoriteTargetType';
import { CategoryModel } from '../../../../infraestructure/db/mongo/models/category.model';
import { FavoriteModel } from '../../../../infraestructure/db/mongo/models/favorite.model';
import { ProductModel } from '../../../../infraestructure/db/mongo/models/product.model';
import { UserModel } from '../../../../infraestructure/db/mongo/models/user.model';
import { sellerActor } from '../../../__mocks__/actor.mock';
import { validCategoryMock } from '../../../__mocks__/category.mock';
import { validFavoriteMock } from '../../../__mocks__/search-favorites.mock';
import { validProductMock } from '../../../__mocks__/product.mock';
import { validUserMock } from '../../../__mocks__/user.mock';

const favoriteService = FavoriteServiceFactory.create();

describe('when we create a favorite for an existing product', () => {
  it('should return the created favorite owned by the actor', async () => {
    const user = validUserMock();
    await UserModel.create(user);
    const category = validCategoryMock();
    await CategoryModel.create(category);
    const product = validProductMock({ categoryId: category.id });
    await ProductModel.create(product);

    const favoriteId = new Types.ObjectId().toHexString();
    const result = await favoriteService.createFavorite(
      {
        id: favoriteId,
        targetType: EFavoriteTargetType.PRODUCT,
        targetId: product.id,
      },
      sellerActor(user.id),
    );

    expect(result).toMatchObject({
      id: favoriteId,
      userId: user.id,
      targetType: EFavoriteTargetType.PRODUCT,
      targetId: product.id,
    });

    const persisted = await FavoriteModel.findOne({ id: favoriteId });
    expect(persisted).not.toBeNull();
  });
});

describe('when we create a duplicate favorite for the same target', () => {
  it('should reject with RESOURCE_CONFLICT', async () => {
    const user = validUserMock();
    await UserModel.create(user);
    const category = validCategoryMock();
    await CategoryModel.create(category);
    const product = validProductMock({ categoryId: category.id });
    await ProductModel.create(product);

    const existing = validFavoriteMock({
      userId: user.id,
      targetType: EFavoriteTargetType.PRODUCT,
      targetId: product.id,
    });
    await FavoriteModel.create(existing);

    await expect(
      favoriteService.createFavorite(
        {
          id: new Types.ObjectId().toHexString(),
          targetType: EFavoriteTargetType.PRODUCT,
          targetId: product.id,
        },
        sellerActor(user.id),
      ),
    ).rejects.toMatchObject({
      status: 409,
      errorCode: EErrorCode.RESOURCE_CONFLICT,
    });
  });
});

describe('when we create a favorite for a missing user', () => {
  it('should reject with RESOURCE_NOT_FOUND', async () => {
    const missingUserId = new Types.ObjectId().toHexString();

    await expect(
      favoriteService.createFavorite(
        {
          id: new Types.ObjectId().toHexString(),
          targetType: EFavoriteTargetType.PRODUCT,
          targetId: new Types.ObjectId().toHexString(),
        },
        sellerActor(missingUserId),
      ),
    ).rejects.toMatchObject({
      status: 404,
      errorCode: EErrorCode.RESOURCE_NOT_FOUND,
      message: 'User not found',
    });
  });
});

describe('when we create a favorite for a missing product', () => {
  it('should reject with RESOURCE_NOT_FOUND', async () => {
    const user = validUserMock();
    await UserModel.create(user);

    await expect(
      favoriteService.createFavorite(
        {
          id: new Types.ObjectId().toHexString(),
          targetType: EFavoriteTargetType.PRODUCT,
          targetId: new Types.ObjectId().toHexString(),
        },
        sellerActor(user.id),
      ),
    ).rejects.toMatchObject({
      status: 404,
      errorCode: EErrorCode.RESOURCE_NOT_FOUND,
      message: 'Product not found',
    });
  });
});
