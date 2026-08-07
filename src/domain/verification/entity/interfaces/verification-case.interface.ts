import { EVerificationCaseStatus } from '../enums/EVerificationCaseStatus';

export interface IVerificationCase {
  id: string;
  listingId: string;
  status: EVerificationCaseStatus;
  checklist?: Record<string, unknown>;
  decisionReason?: string;
  moderatorId?: string;
  createdAt: Date;
  updatedAt?: Date;
}
