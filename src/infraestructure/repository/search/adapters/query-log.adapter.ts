import { IQueryLog } from '../../../../domain/search/entity/interfaces/query-log.interface';
import { IMQueryLog } from '../../../db/mongo/models/query-log.model';

export function dbToInternal(doc: IMQueryLog): IQueryLog {
  return {
    id: doc.id,
    query: doc.query,
    filters: doc.filters,
    resultCount: doc.resultCount,
    actorId: doc.actorId,
    createdAt: doc.createdAt,
  };
}

export function internalToDb(
  log: IQueryLog,
): Omit<IMQueryLog, '_id' | 'createdAt'> & { createdAt?: Date } {
  return {
    id: log.id,
    query: log.query,
    filters: log.filters,
    resultCount: log.resultCount,
    actorId: log.actorId,
    createdAt: log.createdAt,
  };
}
