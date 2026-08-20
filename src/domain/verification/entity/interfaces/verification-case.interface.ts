import { EVerificationCaseStatus } from '../enums/EVerificationCaseStatus';
import {
  IRequiredChange,
  IRevisionBaseline,
} from './required-change.interface';

export interface IVerificationCase {
  id: string;
  listingId: string;
  status: EVerificationCaseStatus;
  checklist?: Record<string, unknown>;
  decisionReason?: string;
  moderatorId?: string;
  requiredChanges?: IRequiredChange[];
  revisionBaseline?: IRevisionBaseline;
  previousCaseId?: string;
  /** SHA-256 hex of plaintext code — internal only; never expose on HTTP. */
  proofCodeHash?: string;
  proofCodeIssuedAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
}
