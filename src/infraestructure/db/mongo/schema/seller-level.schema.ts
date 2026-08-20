import { Schema } from 'mongoose';
import { ESellerLevel } from '../../../../domain/trust/entity/enums/ESellerLevel';
import type { IMSellerLevel } from '../models/seller-level.model';

export const SellerLevelSchema = new Schema<IMSellerLevel>(
  {
    id: { type: String, required: true, unique: true },
    sellerId: { type: String, required: true, unique: true },
    level: {
      type: String,
      enum: Object.values(ESellerLevel),
      required: true,
    },
  },
  { timestamps: { createdAt: false, updatedAt: true }, collection: 'seller_levels' },
);
