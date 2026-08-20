export interface IRefreshSession {
  id: string;
  familyId: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt?: Date;
  accessInvalidatedAt?: Date;
  createdAt: Date;
}
