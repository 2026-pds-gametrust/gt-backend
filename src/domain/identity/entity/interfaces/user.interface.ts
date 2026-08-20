import { EUserStatus } from '../enums/EUserStatus';

export interface IUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  cpf: string;
  birthDate: string;
  verified: boolean;
  phoneVerified: boolean;
  status: EUserStatus;
  groups?: string[];
  createdAt: Date;
  updatedAt?: Date;
}
