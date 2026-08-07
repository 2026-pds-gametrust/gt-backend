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
    if (!favorite.id?.trim()) throw new Error('id is required');
    if (!favorite.userId?.trim()) throw new Error('userId is required');
    if (!favorite.targetType) throw new Error('targetType is required');
    if (!favorite.targetId?.trim()) throw new Error('targetId is required');
    if (!favorite.createdAt) throw new Error('createdAt is required');
  }
}
