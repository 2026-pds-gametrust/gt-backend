import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { ITrustEvent } from '../../../domain/trust/entity/interfaces/trust-event.interface';
import { ITrustEventRepositoryWrite } from '../../../domain/trust/repository/trust-event.repository.write';
import { TrustEventModel } from '../../db/mongo/models/trust-event.model';
import { dbToInternal, internalToDb } from './adapters/trust-event.adapter';

export class TrustEventRepositoryWrite implements ITrustEventRepositoryWrite {
  async appendTrustEvent(event: ITrustEvent): Promise<ITrustEvent> {
    try {
      const doc = await TrustEventModel.create(internalToDb(event));
      return dbToInternal(doc);
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'TrustEventRepositoryWrite.appendTrustEvent',
        eventData: { id: event.id },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
