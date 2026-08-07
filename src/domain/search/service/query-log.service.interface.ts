import { IQueryLog } from '../entity/interfaces/query-log.interface';
import { IQueryLogRepositoryWrite } from '../repository/query-log.repository.write';

export interface IParamsAppendQueryLog {
  query: string;
  filters?: Record<string, unknown>;
  resultCount: number;
  actorId?: string;
}

export interface IParamsQueryLogService {
  queryLogRepositoryWrite: IQueryLogRepositoryWrite;
}

export interface IQueryLogService {
  appendQueryLog(params: IParamsAppendQueryLog): Promise<IQueryLog>;
}
