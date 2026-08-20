import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { EFavoriteTargetType } from '../../../domain/favorites/entity/enums/EFavoriteTargetType';
import { IFavorite } from '../../../domain/favorites/entity/interfaces/favorite.interface';
import { IFavoriteRepositoryRead } from '../../../domain/favorites/repository/favorite.repository.read';
import { FavoriteModel } from '../../db/mongo/models/favorite.model';
import { dbToInternal } from './adapters/favorite.adapter';

export class FavoriteRepositoryRead implements IFavoriteRepositoryRead {
  async findFavoriteById(id: string): Promise<IFavorite | null> {
    try {
      const doc = await FavoriteModel.findOne({ id });
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'FavoriteRepositoryRead.findFavoriteById',
        eventData: { id },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async findByUserTarget(
    userId: string,
    targetType: EFavoriteTargetType,
    targetId: string,
  ): Promise<IFavorite | null> {
    try {
      const doc = await FavoriteModel.findOne({
        userId,
        targetType,
        targetId,
      });
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'FavoriteRepositoryRead.findByUserTarget',
        eventData: { userId, targetType, targetId },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async listByUserId(userId: string): Promise<IFavorite[]> {
    try {
      const docs = await FavoriteModel.find({ userId });
      return docs.map(dbToInternal);
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'FavoriteRepositoryRead.listByUserId',
        eventData: { userId },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
