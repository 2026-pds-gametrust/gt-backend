export interface IQueryLog {
  id: string;
  query: string;
  filters?: Record<string, unknown>;
  resultCount: number;
  actorId?: string;
  createdAt: Date;
}
