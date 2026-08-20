import { Types } from 'mongoose';
import { ICredential } from '../../../../domain/identity/entity/interfaces/credential.interface';

export interface IMCredential extends Omit<ICredential, '_id'> {
  _id: Types.ObjectId;
  updatedAt: Date;
}
