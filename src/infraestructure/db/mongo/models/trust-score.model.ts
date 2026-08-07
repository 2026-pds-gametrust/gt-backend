import { Types, model } from 'mongoose';
import { ITrustScore } from '../../../../domain/trust/entity/interfaces/trust-score.interface';
import { TrustScoreSchema } from '../schema/trust-score.schema';

export interface IMTrustScore extends Omit<ITrustScore, '_id'> {
  _id: Types.ObjectId;
  updatedAt: Date;
}

export const TrustScoreModel = model<IMTrustScore>(
  'TrustScore',
  TrustScoreSchema,
);
