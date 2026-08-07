import { Types } from 'mongoose';
import { buildValidCpf } from '../../domain/common/types/cpf';
import { EUserStatus } from '../../domain/identity/entity/enums/EUserStatus';
import { IUser } from '../../domain/identity/entity/interfaces/user.interface';

let cpfSeed = Date.now();

export const validUserMock = (override?: Partial<IUser>): IUser => {
  cpfSeed += 1;
  return {
    id: new Types.ObjectId().toHexString(),
    fullName: 'Almera dos Codes',
    email: override?.email ?? `almera.codes+${Date.now()}${cpfSeed}@email.com`,
    phone: '+5511999999999',
    cpf: override?.cpf ?? buildValidCpf(cpfSeed),
    birthDate: '1990-01-15',
    verified: false,
    phoneVerified: false,
    status: EUserStatus.PENDING_VERIFICATION,
    createdAt: new Date(),
    ...override,
  };
};
