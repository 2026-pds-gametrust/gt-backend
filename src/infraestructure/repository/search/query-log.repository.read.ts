import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { IQueryLog } from '../../../domain/search/entity/interfaces/query-log.interface';
import { IQueryLogRepositoryRead } from '../../../domain/search/repository/query-log.repository.read';
import { QueryLogModel } from '../../db/mongo/models/query-log.model';
import { dbToInternal } from './adapters/query-log.adapter';

export class QueryLogRepositoryRead implements IQueryLogRepositoryRead {
  async findById(id: string): Promise<IQueryLog | null> {
    try {
      const doc = await QueryLogModel.findOne({ id });
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'QueryLogRepositoryRead.findById',
        eventData: { id },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async listRecent(limit = 50): Promise<IQueryLog[]> {
    try {
      const docs = await QueryLogModel.find()
        .sort({ createdAt: -1 })
        .limit(limit);
      return docs.map(dbToInternal);
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'QueryLogRepositoryRead.listRecent',
        eventData: { limit },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
