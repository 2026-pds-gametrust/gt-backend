import { ESealStatus } from './enums/ESealStatus';
import { ESealType } from './enums/ESealType';
import { ISeal } from './interfaces/seal.interface';

export class SealServiceEntity implements ISeal {
  id: string;
  listingId: string;
  caseId: string;
  type: ESealType;
  status: ESealStatus;
  grantedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt?: Date;

  constructor(seal: ISeal) {
    this.validate(seal);
    this.id = seal.id;
    this.listingId = seal.listingId.trim();
    this.caseId = seal.caseId.trim();
    this.type = seal.type;
    this.status = seal.status;
    this.grantedAt = seal.grantedAt;
    this.expiresAt = seal.expiresAt;
    this.createdAt = seal.createdAt || new Date();
    this.updatedAt = seal.updatedAt;
  }

  private validate(seal: ISeal): void {
    if (!seal.id?.trim()) {
      throw new Error('id is required');
    }
    if (!seal.listingId?.trim()) {
      throw new Error('listingId is required');
    }
    if (!seal.caseId?.trim()) {
      throw new Error('caseId is required');
    }
    if (!seal.type) {
      throw new Error('type is required');
    }
    if (!seal.status) {
      throw new Error('status is required');
    }
  }
}
