import { EFavoriteTargetType } from '../enums/EFavoriteTargetType';

export interface IFavorite {
  id: string;
  userId: string;
  targetType: EFavoriteTargetType;
  targetId: string;
  createdAt: Date;
}
