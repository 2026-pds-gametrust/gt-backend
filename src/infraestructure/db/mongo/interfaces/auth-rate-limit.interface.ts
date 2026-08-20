import { Types } from 'mongoose';

export interface IMAuthRateLimit {
  _id: Types.ObjectId;
  key: string;
  hits: number;
  resetAt: Date;
}
