import { model } from 'mongoose';
import { IMAuthRateLimit } from '../interfaces/auth-rate-limit.interface';
import { AuthRateLimitSchema } from '../schema/auth-rate-limit.schema';

export type { IMAuthRateLimit };

export const AuthRateLimitModel = model<IMAuthRateLimit>(
  'AuthRateLimit',
  AuthRateLimitSchema,
);
