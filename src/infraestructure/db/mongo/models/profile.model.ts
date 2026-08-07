import { Types, model } from 'mongoose';
import { IProfile } from '../../../../domain/identity/entity/interfaces/profile.interface';
import { ProfileSchema } from '../schema/profile.schema';

export interface IMProfile extends Omit<IProfile, '_id'> {
  _id: Types.ObjectId;
  updatedAt: Date;
}

export const ProfileModel = model<IMProfile>('Profile', ProfileSchema);
