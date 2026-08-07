import { Schema } from 'mongoose';
import type { IMTrustScore } from '../models/trust-score.model';

export const TrustScoreSchema = new Schema<IMTrustScore>(
  {
    id: { type: String, required: true, unique: true },
    sellerId: { type: String, required: true, unique: true },
    score: { type: Number, required: true },
    components: { type: Schema.Types.Mixed, required: true },
    computedAt: { type: Date, required: true },
  },
  { timestamps: true, collection: 'trust_scores' },
);
