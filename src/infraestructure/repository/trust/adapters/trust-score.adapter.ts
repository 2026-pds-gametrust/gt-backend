import { ITrustScore } from '../../../../domain/trust/entity/interfaces/trust-score.interface';
import { IMTrustScore } from '../../../db/mongo/models/trust-score.model';

export function dbToInternal(doc: IMTrustScore): ITrustScore {
  return {
    id: doc.id,
    sellerId: doc.sellerId,
    score: doc.score,
    components: doc.components,
    computedAt: doc.computedAt,
    updatedAt: doc.updatedAt,
  };
}

export function internalToDb(
  score: ITrustScore,
): Omit<IMTrustScore, '_id' | 'createdAt' | 'updatedAt'> {
  return {
    id: score.id,
    sellerId: score.sellerId,
    score: score.score,
    components: score.components,
    computedAt: score.computedAt,
  };
}
