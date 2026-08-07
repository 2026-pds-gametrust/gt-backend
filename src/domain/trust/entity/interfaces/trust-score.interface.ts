export interface ITrustScore {
  id: string;
  sellerId: string;
  score: number;
  components: Record<string, number>;
  computedAt: Date;
  updatedAt?: Date;
}
