import { EListingStatus } from '../../../listings/entity/enums/EListingStatus';
import { EVerificationCaseStatus } from '../enums/EVerificationCaseStatus';

export const MODERATION_QUEUE_DEFAULT_LIMIT = 20;
export const MODERATION_QUEUE_MAX_LIMIT = 100;

export interface IModerationQueueStats {
  total: number;
  pending: number;
  inReview: number;
  approved: number;
  changesRequested: number;
  rejected: number;
}

export interface IModerationQueueItem {
  id: string;
  listingId: string;
  status: EVerificationCaseStatus;
  checklist?: Record<string, unknown>;
  /** Latest SUBMIT-scope AI validation score (0–100), when available. */
  aiAnalysisScore?: number;
  decisionReason?: string;
  moderatorId?: string;
  createdAt: Date;
  updatedAt?: Date;
  listingTitle: string;
  listingStatus?: EListingStatus;
  listingCoverPhotoUrl?: string;
  sellerId: string;
  sellerDisplayName: string;
}

export interface IModerationQueuePage {
  items: IModerationQueueItem[];
  total: number;
  limit: number;
  offset: number;
  stats: IModerationQueueStats;
}

export interface IParamsListModerationQueue {
  status?: EVerificationCaseStatus;
  q?: string;
  moderatorId?: string;
  minScore?: number;
  maxScore?: number;
  hasAiScore?: boolean;
  limit?: number;
  offset?: number;
}

export interface IModerationQueueSearchScope {
  q?: string;
  moderatorId?: string;
  listingIds?: string[];
  minScore?: number;
  maxScore?: number;
  hasAiScore?: boolean;
}
