import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { ISellerLevel } from '../../../domain/trust/entity/interfaces/seller-level.interface';
import { ISellerLevelRepositoryWrite } from '../../../domain/trust/repository/seller-level.repository.write';
import { SellerLevelModel } from '../../db/mongo/models/seller-level.model';
import { dbToInternal, internalToDb } from './adapters/seller-level.adapter';

export class SellerLevelRepositoryWrite implements ISellerLevelRepositoryWrite {
  async upsertSellerLevel(sellerLevel: ISellerLevel): Promise<ISellerLevel> {
    try {
      const doc = await SellerLevelModel.findOneAndUpdate(
        { sellerId: sellerLevel.sellerId },
        { $set: internalToDb(sellerLevel) },
        { new: true, upsert: true },
      );
      return dbToInternal(doc!);
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'SellerLevelRepositoryWrite.upsertSellerLevel',
        eventData: { sellerId: sellerLevel.sellerId },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
