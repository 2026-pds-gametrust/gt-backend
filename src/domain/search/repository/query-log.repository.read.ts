import { IQueryLog } from '../entity/interfaces/query-log.interface';

export interface IQueryLogRepositoryRead {
  findById(id: string): Promise<IQueryLog | null>;
  listRecent(limit?: number): Promise<IQueryLog[]>;
}
