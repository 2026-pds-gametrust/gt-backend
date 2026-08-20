import { IFavorite } from '../entity/interfaces/favorite.interface';
import { EFavoriteTargetType } from '../entity/enums/EFavoriteTargetType';

export interface IFavoriteRepositoryRead {
  findFavoriteById(id: string): Promise<IFavorite | null>;
  findByUserTarget(
    userId: string,
    targetType: EFavoriteTargetType,
    targetId: string,
  ): Promise<IFavorite | null>;
  listByUserId(userId: string): Promise<IFavorite[]>;
}
