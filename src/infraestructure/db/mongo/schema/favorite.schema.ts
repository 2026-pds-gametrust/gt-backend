import { Schema } from 'mongoose';
import { EFavoriteTargetType } from '../../../../domain/favorites/entity/enums/EFavoriteTargetType';
import type { IMFavorite } from '../models/favorite.model';

export const FavoriteSchema = new Schema<IMFavorite>(
  {
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    targetType: {
      type: String,
      enum: Object.values(EFavoriteTargetType),
      required: true,
    },
    targetId: { type: String, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'favorites',
  },
);

FavoriteSchema.index(
  { userId: 1, targetType: 1, targetId: 1 },
  { unique: true },
);
