import { ITrustScore } from './interfaces/trust-score.interface';

export class TrustScoreServiceEntity implements ITrustScore {
  id: string;
  sellerId: string;
  score: number;
  components: Record<string, number>;
  computedAt: Date;
  updatedAt?: Date;

  constructor(trustScore: ITrustScore) {
    this.validate(trustScore);
    this.id = trustScore.id;
    this.sellerId = trustScore.sellerId.trim();
    this.score = trustScore.score;
    this.components = { ...trustScore.components };
    this.computedAt = trustScore.computedAt || new Date();
    this.updatedAt = trustScore.updatedAt;
  }

  private validate(trustScore: ITrustScore): void {
    if (!trustScore.id?.trim()) {
      throw new Error('id is required');
    }
    if (!trustScore.sellerId?.trim()) {
      throw new Error('sellerId is required');
    }
    if (typeof trustScore.score !== 'number' || Number.isNaN(trustScore.score)) {
      throw new Error('score must be a number');
    }
    if (!trustScore.components || typeof trustScore.components !== 'object') {
      throw new Error('components is required');
    }
  }
}
