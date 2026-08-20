import { ITrustScore } from '../entity/interfaces/trust-score.interface';

export interface ITrustScoreRepositoryWrite {
  createTrustScore(score: ITrustScore): Promise<ITrustScore>;
  updateTrustScoreBySellerId(
    sellerId: string,
    data: Partial<ITrustScore>,
  ): Promise<ITrustScore | null>;
  upsertTrustScore(score: ITrustScore): Promise<ITrustScore>;
}
