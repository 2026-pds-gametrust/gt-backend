import { EVerificationCaseStatus } from './enums/EVerificationCaseStatus';
import { IVerificationCase } from './interfaces/verification-case.interface';

export class VerificationCaseServiceEntity implements IVerificationCase {
  id: string;
  listingId: string;
  status: EVerificationCaseStatus;
  checklist?: Record<string, unknown>;
  decisionReason?: string;
  moderatorId?: string;
  createdAt: Date;
  updatedAt?: Date;

  constructor(verificationCase: IVerificationCase) {
    this.validate(verificationCase);
    this.id = verificationCase.id;
    this.listingId = verificationCase.listingId.trim();
    this.status = verificationCase.status;
    this.checklist = verificationCase.checklist;
    this.decisionReason = verificationCase.decisionReason?.trim();
    this.moderatorId = verificationCase.moderatorId?.trim();
    this.createdAt = verificationCase.createdAt || new Date();
    this.updatedAt = verificationCase.updatedAt;
  }

  private validate(verificationCase: IVerificationCase): void {
    if (!verificationCase.id?.trim()) {
      throw new Error('id is required');
    }
    if (!verificationCase.listingId?.trim()) {
      throw new Error('listingId is required');
    }
    if (!verificationCase.status) {
      throw new Error('status is required');
    }
  }
}
