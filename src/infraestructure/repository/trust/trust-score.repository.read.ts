import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { ITrustScore } from '../../../domain/trust/entity/interfaces/trust-score.interface';
import { ITrustScoreRepositoryRead } from '../../../domain/trust/repository/trust-score.repository.read';
import { TrustScoreModel } from '../../db/mongo/models/trust-score.model';
import { dbToInternal } from './adapters/trust-score.adapter';

export class TrustScoreRepositoryRead implements ITrustScoreRepositoryRead {
  async findTrustScoreBySellerId(
    sellerId: string,
  ): Promise<ITrustScore | null> {
    try {
      const doc = await TrustScoreModel.findOne({ sellerId });
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'TrustScoreRepositoryRead.findTrustScoreBySellerId',
        eventData: { sellerId },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async findTrustScoreById(id: string): Promise<ITrustScore | null> {
    try {
      const doc = await TrustScoreModel.findOne({ id });
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'TrustScoreRepositoryRead.findTrustScoreById',
        eventData: { id },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
