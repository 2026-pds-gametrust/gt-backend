import { IRefreshSession } from '../entity/interfaces/refresh-session.interface';

export interface IRefreshSessionRepositoryWrite {
  createRefreshSession(session: IRefreshSession): Promise<IRefreshSession>;
  revokeIfUnrevoked(id: string): Promise<IRefreshSession | null>;
  revokeById(id: string): Promise<IRefreshSession | null>;
  invalidateAccessAndRevokeById(id: string): Promise<IRefreshSession | null>;
  revokeFamilyById(familyId: string): Promise<void>;
}
