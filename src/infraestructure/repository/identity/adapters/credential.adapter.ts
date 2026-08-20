import { ICredential } from '../../../../domain/identity/entity/interfaces/credential.interface';
import { IMCredential } from '../../../db/mongo/interfaces/credential.interface';

export function dbToInternal(credential: IMCredential): ICredential {
  return {
    id: credential.id,
    userId: credential.userId,
    passwordHash: credential.passwordHash,
    createdAt: credential.createdAt,
    updatedAt: credential.updatedAt,
  };
}

export function internalToDb(
  credential: ICredential,
): Omit<IMCredential, '_id' | 'createdAt' | 'updatedAt'> {
  return {
    id: credential.id,
    userId: credential.userId,
    passwordHash: credential.passwordHash,
  };
}
