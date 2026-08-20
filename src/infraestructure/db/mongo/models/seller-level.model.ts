import { Types, model } from 'mongoose';
import { ISellerLevel } from '../../../../domain/trust/entity/interfaces/seller-level.interface';
import { SellerLevelSchema } from '../schema/seller-level.schema';

export interface IMSellerLevel extends Omit<ISellerLevel, '_id'> {
  _id: Types.ObjectId;
  updatedAt: Date;
}

export const SellerLevelModel = model<IMSellerLevel>(
  'SellerLevel',
  SellerLevelSchema,
);
