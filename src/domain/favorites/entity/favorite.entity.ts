import { requireNonEmptyString } from '../../common/types/required-string';
import { EFavoriteTargetType } from './enums/EFavoriteTargetType';
import { IFavorite } from './interfaces/favorite.interface';

export class FavoriteServiceEntity implements IFavorite {
  id: string;
  userId: string;
  targetType: EFavoriteTargetType;
  targetId: string;
  createdAt: Date;

  constructor(favorite: IFavorite) {
    this.validate(favorite);
    this.id = favorite.id;
    this.userId = favorite.userId.trim();
    this.targetType = favorite.targetType;
    this.targetId = favorite.targetId.trim();
    this.createdAt = favorite.createdAt;
  }

  private validate(favorite: IFavorite): void {
    requireNonEmptyString(favorite.id, 'id');
    requireNonEmptyString(favorite.userId, 'userId');
    if (!favorite.targetType) throw new Error('targetType is required');
    requireNonEmptyString(favorite.targetId, 'targetId');
    if (!favorite.createdAt) throw new Error('createdAt is required');
  }
}
