import { model } from 'mongoose';
import { IMRefreshSession } from '../interfaces/refresh-session.interface';
import { RefreshSessionSchema } from '../schema/refresh-session.schema';

export type { IMRefreshSession };

export const RefreshSessionModel = model<IMRefreshSession>(
  'RefreshSession',
  RefreshSessionSchema,
);
