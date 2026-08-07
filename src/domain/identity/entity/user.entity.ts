import { isValidCpf } from '../../common/types/cpf';
import { EUserStatus } from './enums/EUserStatus';
import { IUser } from './interfaces/user.interface';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export class UserServiceEntity implements IUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  cpf: string;
  birthDate: string;
  verified: boolean;
  phoneVerified: boolean;
  status: EUserStatus;
  createdAt: Date;
  updatedAt?: Date;

  constructor(user: IUser) {
    this.validateUser(user);
    this.id = user.id;
    this.fullName = user.fullName.trim();
    this.email = user.email.trim().toLowerCase();
    this.phone = user.phone.trim();
    this.cpf = user.cpf.replace(/\D/g, '');
    this.birthDate = user.birthDate;
    this.verified = user.verified ?? false;
    this.phoneVerified = user.phoneVerified ?? false;
    this.status = user.status ?? EUserStatus.PENDING_VERIFICATION;
    this.createdAt = user.createdAt || new Date();
    this.updatedAt = user.updatedAt;
  }

  private validateUser(user: IUser): void {
    if (!user.fullName?.trim() || user.fullName.trim().length < 3) {
      throw new Error('fullName must be at least 3 characters');
    }
    if (!user.email?.trim() || !EMAIL_REGEX.test(user.email.trim())) {
      throw new Error('Please provide a valid email address');
    }
    if (!user.phone?.trim()) {
      throw new Error('phone is required');
    }
    const digits = user.cpf?.replace(/\D/g, '') ?? '';
    if (!isValidCpf(digits)) {
      throw new Error('Please provide a valid CPF');
    }
    if (!user.birthDate || !ISO_DATE_REGEX.test(user.birthDate)) {
      throw new Error('birthDate must be YYYY-MM-DD');
    }
    const birth = new Date(`${user.birthDate}T00:00:00.000Z`);
    if (Number.isNaN(birth.getTime())) {
      throw new Error('birthDate is not a valid date');
    }
    const today = new Date();
    const todayUtc = Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate(),
    );
    if (birth.getTime() > todayUtc) {
      throw new Error('birthDate cannot be in the future');
    }
  }
}
