import { requireNonEmptyString } from '../../common/types/required-string';
import { IRefreshSession } from './interfaces/refresh-session.interface';

export class RefreshSessionServiceEntity implements IRefreshSession {
  id: string;
  familyId: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt?: Date;
  accessInvalidatedAt?: Date;
  createdAt: Date;

  constructor(session: IRefreshSession) {
    requireNonEmptyString(session.id, 'id');
    requireNonEmptyString(session.familyId, 'familyId');
    requireNonEmptyString(session.userId, 'userId');
    requireNonEmptyString(session.tokenHash, 'tokenHash');
    if (!(session.expiresAt instanceof Date) || Number.isNaN(session.expiresAt.getTime())) {
      throw new Error('expiresAt must be a valid date');
    }
    this.id = session.id;
    this.familyId = session.familyId;
    this.userId = session.userId;
    this.tokenHash = session.tokenHash;
    this.expiresAt = session.expiresAt;
    this.revokedAt = session.revokedAt;
    this.accessInvalidatedAt = session.accessInvalidatedAt;
    this.createdAt = session.createdAt || new Date();
  }
}
