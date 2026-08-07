import { IFavorite } from '../entity/interfaces/favorite.interface';

export interface IFavoriteRepositoryWrite {
  createFavorite(favorite: IFavorite): Promise<IFavorite>;
  deleteFavoriteById(id: string): Promise<boolean>;
}
