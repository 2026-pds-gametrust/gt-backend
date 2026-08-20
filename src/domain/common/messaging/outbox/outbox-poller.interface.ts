export interface IOutboxPoller {
  drainPending(limit?: number): Promise<number>;
}
