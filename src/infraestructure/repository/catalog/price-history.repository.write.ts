import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { IPriceHistory } from '../../../domain/catalog/entity/interfaces/price-history.interface';
import { IPriceHistoryRepositoryWrite } from '../../../domain/catalog/repository/price-history.repository.write';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { PriceHistoryModel } from '../../db/mongo/models/price-history.model';
import { dbToInternal, internalToDb } from './adapters/price-history.adapter';

export class PriceHistoryRepositoryWrite
  implements IPriceHistoryRepositoryWrite
{
  async appendPriceHistory(entry: IPriceHistory): Promise<IPriceHistory> {
    try {
      const doc = await PriceHistoryModel.create(internalToDb(entry));
      return dbToInternal(doc);
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'PriceHistoryRepositoryWrite.appendPriceHistory',
        eventData: { entry },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
