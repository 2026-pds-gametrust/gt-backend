import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { IFavorite } from '../../../domain/favorites/entity/interfaces/favorite.interface';
import { IFavoriteRepositoryWrite } from '../../../domain/favorites/repository/favorite.repository.write';
import { FavoriteModel } from '../../db/mongo/models/favorite.model';
import { dbToInternal, internalToDb } from './adapters/favorite.adapter';

export class FavoriteRepositoryWrite implements IFavoriteRepositoryWrite {
  async createFavorite(favorite: IFavorite): Promise<IFavorite> {
    try {
      const created = await FavoriteModel.create(internalToDb(favorite));
      return dbToInternal(created);
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'FavoriteRepositoryWrite.createFavorite',
        eventData: { id: favorite.id },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async deleteFavoriteById(id: string): Promise<boolean> {
    try {
      const result = await FavoriteModel.deleteOne({ id });
      return result.deletedCount > 0;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'FavoriteRepositoryWrite.deleteFavoriteById',
        eventData: { id },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
