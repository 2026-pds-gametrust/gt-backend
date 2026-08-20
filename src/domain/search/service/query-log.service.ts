import { randomUUID } from 'crypto';
import { QueryLogServiceEntity } from '../entity/query-log.entity';
import { IQueryLog } from '../entity/interfaces/query-log.interface';
import {
  IParamsAppendQueryLog,
  IParamsQueryLogService,
  IQueryLogService,
} from './query-log.service.interface';

export class QueryLogService implements IQueryLogService {
  private readonly queryLogRepositoryWrite: IParamsQueryLogService['queryLogRepositoryWrite'];

  constructor({ queryLogRepositoryWrite }: IParamsQueryLogService) {
    this.queryLogRepositoryWrite = queryLogRepositoryWrite;
  }

  async appendQueryLog(params: IParamsAppendQueryLog): Promise<IQueryLog> {
    const entity = new QueryLogServiceEntity({
      id: randomUUID(),
      query: params.query,
      filters: params.filters,
      resultCount: params.resultCount,
      actorId: params.actorId,
      createdAt: new Date(),
    });
    return this.queryLogRepositoryWrite.appendQueryLog(entity);
  }
}
