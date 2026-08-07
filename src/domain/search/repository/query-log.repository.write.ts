import { IQueryLog } from '../entity/interfaces/query-log.interface';

export interface IQueryLogRepositoryWrite {
  appendQueryLog(log: IQueryLog): Promise<IQueryLog>;
}
