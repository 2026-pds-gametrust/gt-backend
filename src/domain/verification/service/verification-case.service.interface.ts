import { IEventPublisher } from '../../common/messaging/event-publisher.interface';
import { IActorContext } from '../../common/types/actor-context';
import { IUserRepositoryRead } from '../../identity/repository/user.repository.read';
import { IProfileRepositoryRead } from '../../identity/repository/profile.repository.read';
import { IListingRepositoryRead } from '../../listings/repository/listing.repository.read';
import { ESealType } from '../entity/enums/ESealType';
import { IProofCode } from '../entity/interfaces/proof-code.interface';
import { IVerificationCase } from '../entity/interfaces/verification-case.interface';
import {
  IModerationQueuePage,
  IParamsListModerationQueue,
} from '../entity/interfaces/moderation-queue.interface';
import { IEvidenceItemRepositoryRead } from '../repository/evidence-item.repository.read';
import { IVerificationCaseRepositoryRead } from '../repository/verification-case.repository.read';
import { IVerificationCaseRepositoryWrite } from '../repository/verification-case.repository.write';
import { IPossessionProofCodeIssuer } from '../ports/possession-proof-code-issuer.interface';
import { ISealService } from './seal.service.interface';

/** Optional enqueue port — never approve/reject/seal (AI assist only). */
export interface IProofCodeAnalysisEnqueuePort {
  requestAnalysis(caseId: string): Promise<unknown>;
  findLatestStatus?(
    caseId: string,
  ): Promise<'PENDING' | 'COMPLETED' | 'UNAVAILABLE' | null>;
}

export interface IParamsAssignReviewer {
  moderatorId: string;
}

export interface IParamsRejectCase {
  reason: string;
}

export interface IParamsRequestChangesCase {
  summary: string;
  requiredChanges: Array<{
    target: string;
    reason: string;
    assetId?: string;
    checklistItemId?: string;
  }>;
}

export interface IParamsOpenVerificationCase {
  id: string;
  listingId: string;
  checklist?: Record<string, unknown>;
  previousCaseId?: string;
}

export interface IParamsApproveCase {
  decisionReason?: string;
  sealType?: ESealType;
}

export interface IParamsVerificationCaseService {
  verificationCaseRepositoryRead: IVerificationCaseRepositoryRead;
  verificationCaseRepositoryWrite: IVerificationCaseRepositoryWrite;
  evidenceItemRepositoryRead: IEvidenceItemRepositoryRead;
  listingRepositoryRead: IListingRepositoryRead;
  userRepositoryRead: IUserRepositoryRead;
  profileRepositoryRead: IProfileRepositoryRead;
  sealService: ISealService;
  eventPublisher: IEventPublisher;
  proofCodeIssuer: IPossessionProofCodeIssuer;
  proofCodeAnalysisEnqueue?: IProofCodeAnalysisEnqueuePort;
}

export interface IVerificationCaseService {
  openCase(params: IParamsOpenVerificationCase): Promise<IVerificationCase>;
  ensureOpenCaseForListing(listingId: string): Promise<IVerificationCase>;
  getVerificationCaseById(id: string): Promise<IVerificationCase>;
  getProofCodePlaintext(
    actor: IActorContext,
    caseId: string,
  ): Promise<IProofCode>;
  getProofCodeForListing(
    actor: IActorContext,
    listingId: string,
  ): Promise<IProofCode>;
  listVerificationCases(
    filter?: Partial<IVerificationCase>,
  ): Promise<IVerificationCase[]>;
  listModerationQueue(
    params: IParamsListModerationQueue,
  ): Promise<IModerationQueuePage>;
  assignReviewer(
    id: string,
    params: IParamsAssignReviewer,
  ): Promise<IVerificationCase>;
  approveCase(
    id: string,
    params?: IParamsApproveCase,
  ): Promise<IVerificationCase>;
  rejectCase(id: string, params: IParamsRejectCase): Promise<IVerificationCase>;
  requestChangesCase(
    id: string,
    params: IParamsRequestChangesCase,
  ): Promise<IVerificationCase>;
}
