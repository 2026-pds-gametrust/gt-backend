import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { ITrustEvent } from '../../../domain/trust/entity/interfaces/trust-event.interface';
import { ITrustEventRepositoryRead } from '../../../domain/trust/repository/trust-event.repository.read';
import { TrustEventModel } from '../../db/mongo/models/trust-event.model';
import { dbToInternal } from './adapters/trust-event.adapter';

export class TrustEventRepositoryRead implements ITrustEventRepositoryRead {
  async findTrustEventById(id: string): Promise<ITrustEvent | null> {
    try {
      const doc = await TrustEventModel.findOne({ id });
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'TrustEventRepositoryRead.findTrustEventById',
        eventData: { id },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async findBySourceEventId(
    sourceEventId: string,
  ): Promise<ITrustEvent | null> {
    try {
      const doc = await TrustEventModel.findOne({ sourceEventId });
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'TrustEventRepositoryRead.findBySourceEventId',
        eventData: { sourceEventId },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async listBySellerId(sellerId: string): Promise<ITrustEvent[]> {
    try {
      const docs = await TrustEventModel.find({ sellerId }).sort({
        occurredAt: 1,
      });
      return docs.map(dbToInternal);
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'TrustEventRepositoryRead.listBySellerId',
        eventData: { sellerId },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
