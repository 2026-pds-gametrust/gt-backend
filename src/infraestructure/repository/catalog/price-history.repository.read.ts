import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { IPriceHistory } from '../../../domain/catalog/entity/interfaces/price-history.interface';
import { IPriceHistoryRepositoryRead } from '../../../domain/catalog/repository/price-history.repository.read';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { PriceHistoryModel } from '../../db/mongo/models/price-history.model';
import { dbToInternal } from './adapters/price-history.adapter';

export class PriceHistoryRepositoryRead implements IPriceHistoryRepositoryRead {
  async findById(id: string): Promise<IPriceHistory | null> {
    try {
      const doc = await PriceHistoryModel.findOne({ id });
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'PriceHistoryRepositoryRead.findById',
        eventData: { id },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async listByProductId(productId: string): Promise<IPriceHistory[]> {
    try {
      const docs = await PriceHistoryModel.find({ productId }).sort({
        observedAt: -1,
      });
      return docs.map(dbToInternal);
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'PriceHistoryRepositoryRead.listByProductId',
        eventData: { productId },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
