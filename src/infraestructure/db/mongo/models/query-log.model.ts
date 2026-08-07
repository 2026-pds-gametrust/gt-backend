import { Types, model } from 'mongoose';
import { IQueryLog } from '../../../../domain/search/entity/interfaces/query-log.interface';
import { QueryLogSchema } from '../schema/query-log.schema';

export interface IMQueryLog extends Omit<IQueryLog, '_id'> {
  _id: Types.ObjectId;
  createdAt: Date;
}

export const QueryLogModel = model<IMQueryLog>('QueryLog', QueryLogSchema);
