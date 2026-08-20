import { IRefreshSession } from '../entity/interfaces/refresh-session.interface';

export interface IRefreshSessionRepositoryRead {
  findByTokenHash(tokenHash: string): Promise<IRefreshSession | null>;
  findRefreshSessionById(id: string): Promise<IRefreshSession | null>;
}
