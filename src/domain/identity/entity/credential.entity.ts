import { requireNonEmptyString } from '../../common/types/required-string';
import { ICredential } from './interfaces/credential.interface';

export class CredentialServiceEntity implements ICredential {
  id: string;
  userId: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt?: Date;

  constructor(credential: ICredential) {
    requireNonEmptyString(credential.userId, 'userId');
    requireNonEmptyString(credential.passwordHash, 'passwordHash');
    this.id = credential.id;
    this.userId = credential.userId;
    this.passwordHash = credential.passwordHash;
    this.createdAt = credential.createdAt || new Date();
    this.updatedAt = credential.updatedAt;
  }
}
