import { Types } from 'mongoose';
import { IRefreshSession } from '../../../../domain/identity/entity/interfaces/refresh-session.interface';

export interface IMRefreshSession extends Omit<IRefreshSession, '_id'> {
  _id: Types.ObjectId;
}
