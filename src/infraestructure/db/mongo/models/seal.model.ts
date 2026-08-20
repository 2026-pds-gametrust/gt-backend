import { Types, model } from 'mongoose';
import { ISeal } from '../../../../domain/verification/entity/interfaces/seal.interface';
import { SealSchema } from '../schema/seal.schema';

export interface IMSeal extends Omit<ISeal, '_id'> {
  _id: Types.ObjectId;
  updatedAt: Date;
}

export const SealModel = model<IMSeal>('Seal', SealSchema);
