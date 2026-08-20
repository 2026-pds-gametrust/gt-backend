import { ITrustScore } from '../entity/interfaces/trust-score.interface';

export interface ITrustScoreRepositoryRead {
  findTrustScoreBySellerId(sellerId: string): Promise<ITrustScore | null>;
  findTrustScoreById(id: string): Promise<ITrustScore | null>;
}
