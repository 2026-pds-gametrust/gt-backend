import { IUser } from '../../../../domain/identity/entity/interfaces/user.interface';
import { IMUser } from '../../../db/mongo/models/user.model';

export function dbToInternal(user: IMUser): IUser {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    cpf: user.cpf,
    birthDate: user.birthDate,
    verified: user.verified,
    phoneVerified: user.phoneVerified,
    status: user.status,
    groups: user.groups ?? [],
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function internalToDb(
  user: IUser,
): Omit<IMUser, '_id' | 'createdAt' | 'updatedAt'> {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    cpf: user.cpf,
    birthDate: user.birthDate,
    verified: user.verified,
    phoneVerified: user.phoneVerified,
    status: user.status,
    groups: user.groups ?? [],
  };
}
