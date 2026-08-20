import { Schema } from 'mongoose';
import type { IMRefreshSession } from '../interfaces/refresh-session.interface';

export const RefreshSessionSchema = new Schema<IMRefreshSession>(
  {
    id: { type: String, required: true, unique: true },
    familyId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, index: true },
    revokedAt: { type: Date, required: false },
    accessInvalidatedAt: { type: Date, required: false },
  },
  { timestamps: true, collection: 'refresh_sessions' },
);

RefreshSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
