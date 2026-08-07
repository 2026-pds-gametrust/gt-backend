import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { ISellerLevel } from '../../../domain/trust/entity/interfaces/seller-level.interface';
import { ISellerLevelRepositoryRead } from '../../../domain/trust/repository/seller-level.repository.read';
import { SellerLevelModel } from '../../db/mongo/models/seller-level.model';
import { dbToInternal } from './adapters/seller-level.adapter';

export class SellerLevelRepositoryRead implements ISellerLevelRepositoryRead {
  async findSellerLevelBySellerId(
    sellerId: string,
  ): Promise<ISellerLevel | null> {
    try {
      const doc = await SellerLevelModel.findOne({ sellerId });
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'SellerLevelRepositoryRead.findSellerLevelBySellerId',
        eventData: { sellerId },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
