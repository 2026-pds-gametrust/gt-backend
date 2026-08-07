import { Types, model } from 'mongoose';
import { IFavorite } from '../../../../domain/favorites/entity/interfaces/favorite.interface';
import { FavoriteSchema } from '../schema/favorite.schema';

export interface IMFavorite extends Omit<IFavorite, '_id'> {
  _id: Types.ObjectId;
  createdAt: Date;
}

export const FavoriteModel = model<IMFavorite>('Favorite', FavoriteSchema);
