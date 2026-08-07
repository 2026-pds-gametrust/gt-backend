import { IQueryLog } from './interfaces/query-log.interface';

export class QueryLogServiceEntity implements IQueryLog {
  id: string;
  query: string;
  filters?: Record<string, unknown>;
  resultCount: number;
  actorId?: string;
  createdAt: Date;

  constructor(log: IQueryLog) {
    this.validate(log);
    this.id = log.id;
    this.query = log.query;
    this.filters = log.filters;
    this.resultCount = log.resultCount;
    this.actorId = log.actorId;
    this.createdAt = log.createdAt;
  }

  private validate(log: IQueryLog): void {
    if (!log.id?.trim()) throw new Error('id is required');
    if (log.query == null) throw new Error('query is required');
    if (log.resultCount == null || log.resultCount < 0) {
      throw new Error('resultCount must be >= 0');
    }
    if (!log.createdAt) throw new Error('createdAt is required');
  }
}
