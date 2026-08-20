import { IAnalysisChecklistItem } from './listing-analysis.interface';
import { EProofCodeAnalysisStatus } from '../enums/EProofCodeAnalysisStatus';

export interface IProofCodeAnalysis {
  id: string;
  caseId: string;
  listingId: string;
  status: EProofCodeAnalysisStatus;
  score?: number;
  items: IAnalysisChecklistItem[];
  modelId?: string;
  promptVersion: string;
  idempotencyKey: string;
  failureReason?: string;
  createdAt: Date;
  updatedAt?: Date;
}

/** Snapshot written to verification_cases.checklist.proofCodeAnalysis only. */
export interface IProofCodeAnalysisSnapshot {
  analysisId: string;
  status: EProofCodeAnalysisStatus;
  items: IAnalysisChecklistItem[];
  score?: number;
  modelId?: string;
  promptVersion: string;
  analyzedAt: string;
}
