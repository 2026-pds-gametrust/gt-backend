import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { IQueryLog } from '../../../domain/search/entity/interfaces/query-log.interface';
import { IQueryLogRepositoryWrite } from '../../../domain/search/repository/query-log.repository.write';
import { QueryLogModel } from '../../db/mongo/models/query-log.model';
import { dbToInternal, internalToDb } from './adapters/query-log.adapter';

export class QueryLogRepositoryWrite implements IQueryLogRepositoryWrite {
  async appendQueryLog(log: IQueryLog): Promise<IQueryLog> {
    try {
      const created = await QueryLogModel.create(internalToDb(log));
      return dbToInternal(created);
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'QueryLogRepositoryWrite.appendQueryLog',
        eventData: { id: log.id },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
