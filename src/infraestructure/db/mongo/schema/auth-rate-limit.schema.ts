import { Schema } from 'mongoose';
import type { IMAuthRateLimit } from '../interfaces/auth-rate-limit.interface';

export const AuthRateLimitSchema = new Schema<IMAuthRateLimit>(
  {
    key: { type: String, required: true, unique: true },
    hits: { type: Number, required: true },
    resetAt: { type: Date, required: true },
  },
  { timestamps: false, collection: 'auth_rate_limits' },
);

AuthRateLimitSchema.index({ resetAt: 1 }, { expireAfterSeconds: 0 });
