import { IFavorite } from '../../../../domain/favorites/entity/interfaces/favorite.interface';
import { IMFavorite } from '../../../db/mongo/models/favorite.model';

export function dbToInternal(doc: IMFavorite): IFavorite {
  return {
    id: doc.id,
    userId: doc.userId,
    targetType: doc.targetType,
    targetId: doc.targetId,
    createdAt: doc.createdAt,
  };
}

export function internalToDb(
  favorite: IFavorite,
): Omit<IMFavorite, '_id' | 'createdAt'> & { createdAt?: Date } {
  return {
    id: favorite.id,
    userId: favorite.userId,
    targetType: favorite.targetType,
    targetId: favorite.targetId,
    createdAt: favorite.createdAt,
  };
}
