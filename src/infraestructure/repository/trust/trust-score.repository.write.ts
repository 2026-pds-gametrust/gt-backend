import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { ITrustScore } from '../../../domain/trust/entity/interfaces/trust-score.interface';
import { ITrustScoreRepositoryWrite } from '../../../domain/trust/repository/trust-score.repository.write';
import { TrustScoreModel } from '../../db/mongo/models/trust-score.model';
import { dbToInternal, internalToDb } from './adapters/trust-score.adapter';

export class TrustScoreRepositoryWrite implements ITrustScoreRepositoryWrite {
  async createTrustScore(score: ITrustScore): Promise<ITrustScore> {
    try {
      const doc = await TrustScoreModel.create(internalToDb(score));
      return dbToInternal(doc);
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'TrustScoreRepositoryWrite.createTrustScore',
        eventData: { id: score.id },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async updateTrustScoreBySellerId(
    sellerId: string,
    data: Partial<ITrustScore>,
  ): Promise<ITrustScore | null> {
    try {
      const doc = await TrustScoreModel.findOneAndUpdate(
        { sellerId },
        { $set: data },
        { new: true },
      );
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'TrustScoreRepositoryWrite.updateTrustScoreBySellerId',
        eventData: { sellerId, data },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async upsertTrustScore(score: ITrustScore): Promise<ITrustScore> {
    try {
      const doc = await TrustScoreModel.findOneAndUpdate(
        { sellerId: score.sellerId },
        { $set: internalToDb(score) },
        { new: true, upsert: true },
      );
      return dbToInternal(doc!);
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'TrustScoreRepositoryWrite.upsertTrustScore',
        eventData: { sellerId: score.sellerId },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
