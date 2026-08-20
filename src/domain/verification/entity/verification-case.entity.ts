import { requireNonEmptyString } from '../../common/types/required-string';
import { EVerificationCaseStatus } from './enums/EVerificationCaseStatus';
import { IVerificationCase } from './interfaces/verification-case.interface';
import {
  IRequiredChange,
  IRevisionBaseline,
} from './interfaces/required-change.interface';

export class VerificationCaseServiceEntity implements IVerificationCase {
  id: string;
  listingId: string;
  status: EVerificationCaseStatus;
  checklist?: Record<string, unknown>;
  decisionReason?: string;
  moderatorId?: string;
  requiredChanges?: IRequiredChange[];
  revisionBaseline?: IRevisionBaseline;
  previousCaseId?: string;
  proofCodeHash?: string;
  proofCodeIssuedAt?: Date;
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
    this.requiredChanges = verificationCase.requiredChanges;
    this.revisionBaseline = verificationCase.revisionBaseline;
    this.previousCaseId = verificationCase.previousCaseId?.trim();
    this.proofCodeHash = verificationCase.proofCodeHash?.trim();
    this.proofCodeIssuedAt = verificationCase.proofCodeIssuedAt;
    this.createdAt = verificationCase.createdAt || new Date();
    this.updatedAt = verificationCase.updatedAt;
  }

  private validate(verificationCase: IVerificationCase): void {
    requireNonEmptyString(verificationCase.id, 'id');
    requireNonEmptyString(verificationCase.listingId, 'listingId');
    if (!verificationCase.status) {
      throw new Error('status is required');
    }
    if (
      verificationCase.proofCodeHash !== undefined &&
      verificationCase.proofCodeHash !== null
    ) {
      const hash = String(verificationCase.proofCodeHash).trim();
      if (!/^[a-f0-9]{64}$/i.test(hash)) {
        throw new Error('proofCodeHash must be a SHA-256 hex digest');
      }
    }
  }
}
