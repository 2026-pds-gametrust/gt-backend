import { EAnalysisChecklistItemStatus } from '../enums/EAnalysisChecklistItemStatus';
import { EListingAnalysisScope } from '../enums/EListingAnalysisScope';
import { EListingAnalysisStatus } from '../enums/EListingAnalysisStatus';

export interface IAnalysisChecklistItem {
  id: string;
  status: EAnalysisChecklistItemStatus;
  weight: number;
  reason: string;
  evidenceRef?: string;
}

export interface IListingAnalysis {
  id: string;
  listingId: string;
  scope: EListingAnalysisScope;
  status: EListingAnalysisStatus;
  score: number;
  items: IAnalysisChecklistItem[];
  modelId?: string;
  promptVersion: string;
  idempotencyKey: string;
  failureReason?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface IListingQualityHints {
  analysisId: string;
  score: number;
  status: EListingAnalysisStatus;
  scope: EListingAnalysisScope;
  items: IAnalysisChecklistItem[];
  analyzedAt: string;
  modelId?: string;
}

export interface IVerificationAiChecklist {
  analysisId: string;
  score: number;
  items: IAnalysisChecklistItem[];
  modelId?: string;
  promptVersion: string;
  analyzedAt: string;
}
