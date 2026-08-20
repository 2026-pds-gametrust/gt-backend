import { FavoriteServiceEntity } from '../../../../domain/favorites/entity/favorite.entity';
import { EFavoriteTargetType } from '../../../../domain/favorites/entity/enums/EFavoriteTargetType';
import { validFavoriteMock } from '../../../__mocks__/search-favorites.mock';

describe('when constructing a favorite entity', () => {
  it('should accept a valid favorite and trim ids', () => {
    const entity = new FavoriteServiceEntity(
      validFavoriteMock({
        userId: '  user-1  ',
        targetId: '  target-1  ',
        targetType: EFavoriteTargetType.PRODUCT,
      }),
    );
    expect(entity.userId).toBe('user-1');
    expect(entity.targetId).toBe('target-1');
  });

  it('should reject missing id', () => {
    expect(
      () => new FavoriteServiceEntity(validFavoriteMock({ id: ' ' })),
    ).toThrow('id is required');
  });

  it('should reject missing userId', () => {
    expect(
      () => new FavoriteServiceEntity(validFavoriteMock({ userId: '' })),
    ).toThrow('userId is required');
  });

  it('should reject missing targetType', () => {
    expect(
      () =>
        new FavoriteServiceEntity(
          validFavoriteMock({ targetType: undefined as any }),
        ),
    ).toThrow('targetType is required');
  });

  it('should reject missing targetId', () => {
    expect(
      () =>
        new FavoriteServiceEntity(validFavoriteMock({ targetId: ' ' })),
    ).toThrow('targetId is required');
  });

  it('should reject missing createdAt', () => {
    expect(
      () =>
        new FavoriteServiceEntity(
          validFavoriteMock({ createdAt: undefined as any }),
        ),
    ).toThrow('createdAt is required');
  });
});
