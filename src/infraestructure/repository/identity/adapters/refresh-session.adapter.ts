import { IRefreshSession } from '../../../../domain/identity/entity/interfaces/refresh-session.interface';
import { IMRefreshSession } from '../../../db/mongo/interfaces/refresh-session.interface';

export function dbToInternal(session: IMRefreshSession): IRefreshSession {
  return {
    id: session.id,
    familyId: session.familyId,
    userId: session.userId,
    tokenHash: session.tokenHash,
    expiresAt: session.expiresAt,
    revokedAt: session.revokedAt,
    accessInvalidatedAt: session.accessInvalidatedAt,
    createdAt: session.createdAt,
  };
}

export function internalToDb(
  session: IRefreshSession,
): Omit<IMRefreshSession, '_id'> {
  return {
    id: session.id,
    familyId: session.familyId,
    userId: session.userId,
    tokenHash: session.tokenHash,
    expiresAt: session.expiresAt,
    revokedAt: session.revokedAt,
    accessInvalidatedAt: session.accessInvalidatedAt,
    createdAt: session.createdAt,
  };
}
