import { IThrowedError } from '@sauvvitech/st-packages';
import { randomUUID } from 'crypto';
import { Logger } from 'traceability';
import { assertOwnerOrAdmin } from '../../common/auth/actor-authorization';
import { EErrorCode } from '../../common/errors/enums/EErrorCode';
import { createEventEnvelope } from '../../common/messaging/event-envelope';
import { IEventPublisher } from '../../common/messaging/event-publisher.interface';
import { IActorContext } from '../../common/types/actor-context';
import { isBlank } from '../../common/types/required-string';
import { IUserRepositoryRead } from '../../identity/repository/user.repository.read';
import { IProfileRepositoryRead } from '../../identity/repository/profile.repository.read';
import { IListing } from '../../listings/entity/interfaces/listing.interface';
import { IListingRepositoryRead } from '../../listings/repository/listing.repository.read';
import { VerificationCaseServiceEntity } from '../entity/verification-case.entity';
import { EEvidenceType } from '../entity/enums/EEvidenceType';
import { ESealType } from '../entity/enums/ESealType';
import { EVerificationCaseStatus } from '../entity/enums/EVerificationCaseStatus';
import {
  IModerationQueueItem,
  IModerationQueuePage,
  IModerationQueueSearchScope,
  IParamsListModerationQueue,
  MODERATION_QUEUE_DEFAULT_LIMIT,
  MODERATION_QUEUE_MAX_LIMIT,
} from '../entity/interfaces/moderation-queue.interface';
import { IProofCode } from '../entity/interfaces/proof-code.interface';
import { IVerificationCase } from '../entity/interfaces/verification-case.interface';
import { toPublicVerificationCase } from '../mappers/public-verification-case';
import { IPossessionProofCodeIssuer } from '../ports/possession-proof-code-issuer.interface';
import { IEvidenceItemRepositoryRead } from '../repository/evidence-item.repository.read';
import { IParamsListModerationQueueQuery } from '../repository/verification-case.repository.read';
import { IVerificationCaseRepositoryRead } from '../repository/verification-case.repository.read';
import { IVerificationCaseRepositoryWrite } from '../repository/verification-case.repository.write';
import { ISealService } from './seal.service.interface';
import {
  IParamsApproveCase,
  IParamsAssignReviewer,
  IParamsOpenVerificationCase,
  IParamsRejectCase,
  IParamsRequestChangesCase,
  IParamsVerificationCaseService,
  IProofCodeAnalysisEnqueuePort,
  IVerificationCaseService,
} from './verification-case.service.interface';
import {
  buildRevisionBaseline,
  normalizeRequiredChanges,
} from '../revision/revision-change.validation';
import { isMinProofEvidenceEligible } from '../proof/proof-evidence-eligibility';
import { EProofCodeAnalysisStatus } from '../../ai/entity/enums/EProofCodeAnalysisStatus';

const ALLOWED_TRANSITIONS: Record<
  EVerificationCaseStatus,
  EVerificationCaseStatus[]
> = {
  [EVerificationCaseStatus.PENDING]: [EVerificationCaseStatus.IN_REVIEW],
  [EVerificationCaseStatus.IN_REVIEW]: [
    EVerificationCaseStatus.APPROVED,
    EVerificationCaseStatus.CHANGES_REQUESTED,
    EVerificationCaseStatus.REJECTED,
  ],
  [EVerificationCaseStatus.APPROVED]: [],
  [EVerificationCaseStatus.CHANGES_REQUESTED]: [],
  [EVerificationCaseStatus.REJECTED]: [],
};

const SEARCH_USER_LIMIT = 20;
const SEARCH_LISTING_TITLE_LIMIT = 50;

export class VerificationCaseService implements IVerificationCaseService {
  private readonly verificationCaseRepositoryRead: IVerificationCaseRepositoryRead;
  private readonly verificationCaseRepositoryWrite: IVerificationCaseRepositoryWrite;
  private readonly evidenceItemRepositoryRead: IEvidenceItemRepositoryRead;
  private readonly listingRepositoryRead: IListingRepositoryRead;
  private readonly userRepositoryRead: IUserRepositoryRead;
  private readonly profileRepositoryRead: IProfileRepositoryRead;
  private readonly sealService: ISealService;
  private readonly eventPublisher: IEventPublisher;
  private readonly proofCodeIssuer: IPossessionProofCodeIssuer;
  private readonly proofCodeAnalysisEnqueue?: IProofCodeAnalysisEnqueuePort;

  constructor({
    verificationCaseRepositoryRead,
    verificationCaseRepositoryWrite,
    evidenceItemRepositoryRead,
    listingRepositoryRead,
    userRepositoryRead,
    profileRepositoryRead,
    sealService,
    eventPublisher,
    proofCodeIssuer,
    proofCodeAnalysisEnqueue,
  }: IParamsVerificationCaseService) {
    this.verificationCaseRepositoryRead = verificationCaseRepositoryRead;
    this.verificationCaseRepositoryWrite = verificationCaseRepositoryWrite;
    this.evidenceItemRepositoryRead = evidenceItemRepositoryRead;
    this.listingRepositoryRead = listingRepositoryRead;
    this.userRepositoryRead = userRepositoryRead;
    this.profileRepositoryRead = profileRepositoryRead;
    this.sealService = sealService;
    this.eventPublisher = eventPublisher;
    this.proofCodeIssuer = proofCodeIssuer;
    this.proofCodeAnalysisEnqueue = proofCodeAnalysisEnqueue;
  }

  async openCase(
    params: IParamsOpenVerificationCase,
  ): Promise<IVerificationCase> {
    const listing = await this.listingRepositoryRead.findListingById(
      params.listingId,
    );
    if (!listing) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Listing not found',
        details: { listingId: params.listingId },
      } as IThrowedError;
    }

    const openCase =
      await this.verificationCaseRepositoryRead.findOpenCaseByListingId(
        params.listingId,
      );
    if (openCase) {
      throw {
        status: 409,
        errorCode: EErrorCode.RESOURCE_CONFLICT,
        message: 'Listing already has an open verification case',
        details: { listingId: params.listingId, caseId: openCase.id },
      } as IThrowedError;
    }

    const entity = new VerificationCaseServiceEntity({
      id: params.id,
      listingId: params.listingId,
      status: EVerificationCaseStatus.PENDING,
      checklist: params.checklist,
      previousCaseId: params.previousCaseId,
      createdAt: new Date(),
    });

    const created =
      await this.verificationCaseRepositoryWrite.createVerificationCase(entity);

    const withChallenge = await this.ensureChallenge(created);

    await this.eventPublisher.publish(
      createEventEnvelope({
        eventId: randomUUID(),
        eventType: 'verification.case.submitted',
        aggregateId: withChallenge.id,
        producerModule: 'verification',
        correlationId: randomUUID(),
        payload: {
          caseId: withChallenge.id,
          listingId: withChallenge.listingId,
        },
      }),
    );

    return toPublicVerificationCase(withChallenge);
  }

  async ensureOpenCaseForListing(
    listingId: string,
  ): Promise<IVerificationCase> {
    const openCase =
      await this.verificationCaseRepositoryRead.findOpenCaseByListingId(
        listingId,
      );
    if (openCase) {
      return toPublicVerificationCase(openCase);
    }

    try {
      const previousCase =
        await this.verificationCaseRepositoryRead.findLatestChangesRequestedCaseByListingId(
          listingId,
        );
      return await this.openCase({
        id: randomUUID(),
        listingId,
        previousCaseId: previousCase?.id,
      });
    } catch (error) {
      const throwed = error as IThrowedError;
      if (throwed?.status === 409) {
        const raced =
          await this.verificationCaseRepositoryRead.findOpenCaseByListingId(
            listingId,
          );
        if (raced) {
          return toPublicVerificationCase(raced);
        }
      }
      throw error;
    }
  }

  async getVerificationCaseById(id: string): Promise<IVerificationCase> {
    const verificationCase =
      await this.verificationCaseRepositoryRead.findVerificationCaseById(id);
    if (!verificationCase) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Verification case not found',
        details: { id },
      } as IThrowedError;
    }
    return toPublicVerificationCase(verificationCase);
  }

  async getProofCodePlaintext(
    actor: IActorContext,
    caseId: string,
  ): Promise<IProofCode> {
    const verificationCase =
      await this.verificationCaseRepositoryRead.findVerificationCaseById(
        caseId,
      );
    if (!verificationCase) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Verification case not found',
        details: { id: caseId },
      } as IThrowedError;
    }

    const listing = await this.listingRepositoryRead.findListingById(
      verificationCase.listingId,
    );
    if (!listing) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Listing not found',
        details: { listingId: verificationCase.listingId },
      } as IThrowedError;
    }

    assertOwnerOrAdmin(actor, listing.sellerId);

    const ensured = await this.ensureChallenge(verificationCase);
    const issued = this.proofCodeIssuer.issueForCase(ensured.id);

    return {
      code: issued.code,
      caseId: ensured.id,
      listingId: ensured.listingId,
      issuedAt: ensured.proofCodeIssuedAt ?? new Date(),
    };
  }

  /**
   * Opens (or reuses) the verification case for a listing owned by the actor,
   * then returns the possession proof code — so sellers can photograph the code
   * during draft media capture, before final submit.
   */
  async getProofCodeForListing(
    actor: IActorContext,
    listingId: string,
  ): Promise<IProofCode> {
    const listing = await this.listingRepositoryRead.findListingById(listingId);
    if (!listing) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Listing not found',
        details: { listingId },
      } as IThrowedError;
    }

    assertOwnerOrAdmin(actor, listing.sellerId);

    const openCase = await this.ensureOpenCaseForListing(listingId);
    return this.getProofCodePlaintext(actor, openCase.id);
  }

  async listVerificationCases(
    filter: Partial<IVerificationCase> = {},
  ): Promise<IVerificationCase[]> {
    const cases =
      await this.verificationCaseRepositoryRead.listVerificationCases(filter);
    return cases.map(toPublicVerificationCase);
  }

  async listModerationQueue(
    params: IParamsListModerationQueue,
  ): Promise<IModerationQueuePage> {
    const status = this.parseModerationStatusFilter(params.status);
    const { limit, offset } = this.parseModerationPagination(params);
    const scope = await this.buildModerationSearchScope(params);

    const scoreFilter = this.parseModerationScoreFilter(params);

    const query: IParamsListModerationQueueQuery = {
      scope: { ...scope, ...scoreFilter },
      status,
      limit,
      offset,
    };

    const [cases, total, stats] = await Promise.all([
      this.verificationCaseRepositoryRead.listModerationQueue(query),
      this.verificationCaseRepositoryRead.countModerationQueue(query),
      this.verificationCaseRepositoryRead.countModerationQueueStats(scope),
    ]);

    const items = await this.enrichModerationQueueItems(cases);

    return {
      items,
      total,
      limit,
      offset,
      stats,
    };
  }

  async assignReviewer(
    id: string,
    params: IParamsAssignReviewer,
  ): Promise<IVerificationCase> {
    const existing =
      await this.verificationCaseRepositoryRead.findVerificationCaseById(id);
    if (!existing) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Verification case not found',
        details: { id },
      } as IThrowedError;
    }

    this.assertTransition(
      existing.status,
      EVerificationCaseStatus.IN_REVIEW,
    );

    if (isBlank(params.moderatorId)) {
      throw {
        status: 400,
        errorCode: EErrorCode.FIELD_INVALID,
        message: 'moderatorId is required',
        details: { field: 'moderatorId' },
      } as IThrowedError;
    }

    await this.ensureChallenge(existing);
    await this.assertProofEvidenceEligible(existing);

    const updated =
      await this.verificationCaseRepositoryWrite.updateVerificationCaseById(
        id,
        {
          status: EVerificationCaseStatus.IN_REVIEW,
          moderatorId: params.moderatorId,
        },
      );
    if (!updated) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Verification case not found',
        details: { id },
      } as IThrowedError;
    }

    this.enqueueProofCodeAnalysisFallback(updated.id);

    return toPublicVerificationCase(updated);
  }

  async approveCase(
    id: string,
    params: IParamsApproveCase = {},
  ): Promise<IVerificationCase> {
    const existing = await this.getVerificationCaseById(id);
    this.assertTransition(
      existing.status,
      EVerificationCaseStatus.APPROVED,
    );

    const listing = await this.listingRepositoryRead.findListingById(
      existing.listingId,
    );
    if (!listing) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Listing not found',
        details: { listingId: existing.listingId },
      } as IThrowedError;
    }

    const updated =
      await this.verificationCaseRepositoryWrite.updateVerificationCaseById(
        id,
        {
          status: EVerificationCaseStatus.APPROVED,
          decisionReason: params.decisionReason,
        },
      );
    if (!updated) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Verification case not found',
        details: { id },
      } as IThrowedError;
    }

    const approvedEventId = randomUUID();
    await this.eventPublisher.publish(
      createEventEnvelope({
        eventId: approvedEventId,
        eventType: 'verification.case.approved',
        aggregateId: updated.id,
        producerModule: 'verification',
        correlationId: randomUUID(),
        payload: {
          caseId: updated.id,
          listingId: updated.listingId,
        },
      }),
    );

    await this.sealService.grantSeal({
      id: randomUUID(),
      listingId: updated.listingId,
      caseId: updated.id,
      type: params.sealType ?? ESealType.POSSESSION,
      sellerId: listing.sellerId,
      sourceEventId: `seal-granted:${updated.id}`,
    });

    return toPublicVerificationCase(updated);
  }

  async rejectCase(
    id: string,
    params: IParamsRejectCase,
  ): Promise<IVerificationCase> {
    const existing = await this.getVerificationCaseById(id);
    this.assertTransition(
      existing.status,
      EVerificationCaseStatus.REJECTED,
    );

    if (isBlank(params.reason)) {
      throw {
        status: 400,
        errorCode: EErrorCode.FIELD_INVALID,
        message: 'reason is required to reject',
        details: { field: 'reason' },
      } as IThrowedError;
    }

    const updated =
      await this.verificationCaseRepositoryWrite.updateVerificationCaseById(
        id,
        {
          status: EVerificationCaseStatus.REJECTED,
          decisionReason: params.reason,
        },
      );
    if (!updated) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Verification case not found',
        details: { id },
      } as IThrowedError;
    }

    await this.eventPublisher.publish(
      createEventEnvelope({
        eventId: randomUUID(),
        eventType: 'verification.case.rejected',
        aggregateId: updated.id,
        producerModule: 'verification',
        correlationId: randomUUID(),
        payload: {
          caseId: updated.id,
          listingId: updated.listingId,
          reason: params.reason,
        },
      }),
    );

    return toPublicVerificationCase(updated);
  }

  async requestChangesCase(
    id: string,
    params: IParamsRequestChangesCase,
  ): Promise<IVerificationCase> {
    const existing = await this.getVerificationCaseById(id);
    this.assertTransition(
      existing.status,
      EVerificationCaseStatus.CHANGES_REQUESTED,
    );

    if (isBlank(params.summary)) {
      throw {
        status: 400,
        errorCode: EErrorCode.FIELD_INVALID,
        message: 'summary is required to request changes',
        details: { field: 'summary' },
      } as IThrowedError;
    }

    const listing = await this.listingRepositoryRead.findListingById(
      existing.listingId,
    );
    if (!listing) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Listing not found',
        details: { listingId: existing.listingId },
      } as IThrowedError;
    }

    const requiredChanges = normalizeRequiredChanges(
      params.requiredChanges ?? [],
      listing,
    );
    const revisionBaseline = buildRevisionBaseline(listing);

    const updated =
      await this.verificationCaseRepositoryWrite.updateVerificationCaseById(
        id,
        {
          status: EVerificationCaseStatus.CHANGES_REQUESTED,
          decisionReason: params.summary.trim(),
          requiredChanges,
          revisionBaseline,
        },
      );
    if (!updated) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Verification case not found',
        details: { id },
      } as IThrowedError;
    }

    await this.eventPublisher.publish(
      createEventEnvelope({
        eventId: randomUUID(),
        eventType: 'verification.case.changes_requested',
        aggregateId: updated.id,
        producerModule: 'verification',
        correlationId: randomUUID(),
        payload: {
          caseId: updated.id,
          listingId: updated.listingId,
          summary: params.summary.trim(),
          requiredChanges,
        },
      }),
    );

    return toPublicVerificationCase(updated);
  }

  private async ensureChallenge(
    verificationCase: IVerificationCase,
  ): Promise<IVerificationCase> {
    if (verificationCase.proofCodeHash && verificationCase.proofCodeIssuedAt) {
      return verificationCase;
    }

    const issued = this.proofCodeIssuer.issueForCase(verificationCase.id);
    const issuedAt = verificationCase.proofCodeIssuedAt ?? new Date();
    const updated =
      await this.verificationCaseRepositoryWrite.updateVerificationCaseById(
        verificationCase.id,
        {
          proofCodeHash: issued.hash,
          proofCodeIssuedAt: issuedAt,
        },
      );
    if (!updated) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Verification case not found',
        details: { id: verificationCase.id },
      } as IThrowedError;
    }

    Logger.info(
      `verification.proof_code.issued caseId=${updated.id} listingId=${updated.listingId}`,
    );

    return updated;
  }

  private async assertProofEvidenceEligible(
    verificationCase: IVerificationCase,
  ): Promise<void> {
    const listing = await this.listingRepositoryRead.findListingById(
      verificationCase.listingId,
    );
    if (!listing) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Listing not found',
        details: { listingId: verificationCase.listingId },
      } as IThrowedError;
    }

    const evidence = await this.evidenceItemRepositoryRead.listByCaseId(
      verificationCase.id,
    );
    if (isMinProofEvidenceEligible(evidence, listing)) {
      return;
    }

    const listingHasVideo = Boolean(
      listing.media?.videoAssetId || listing.media?.videoUrl,
    );
    const hasPhoto = evidence.some(
      (item) => item.type === EEvidenceType.PHOTO,
    );
    if (!hasPhoto) {
      Logger.info(
        `verification.assign.rejected_missing_evidence caseId=${verificationCase.id} missing=PHOTO`,
      );
      throw {
        status: 400,
        errorCode: EErrorCode.STATUS_REQUIRES_FIELDS,
        message: 'PHOTO evidence is required before assign',
        details: { field: 'evidence', required: ['PHOTO'] },
      } as IThrowedError;
    }

    if (listingHasVideo) {
      Logger.info(
        `verification.assign.rejected_missing_evidence caseId=${verificationCase.id} missing=VIDEO`,
      );
      throw {
        status: 400,
        errorCode: EErrorCode.STATUS_REQUIRES_FIELDS,
        message: 'VIDEO evidence is required when listing has video',
        details: { field: 'evidence', required: ['PHOTO', 'VIDEO'] },
      } as IThrowedError;
    }
  }

  /**
   * Must fallback: if eligible and no recent COMPLETED|UNAVAILABLE possession analysis,
   * fire-and-forget enqueue (does not block assign HTTP on Gemini).
   */
  private enqueueProofCodeAnalysisFallback(caseId: string): void {
    const enqueue = this.proofCodeAnalysisEnqueue;
    if (!enqueue) {
      return;
    }

    void (async () => {
      try {
        if (enqueue.findLatestStatus) {
          const latest = await enqueue.findLatestStatus(caseId);
          if (
            latest === EProofCodeAnalysisStatus.COMPLETED ||
            latest === EProofCodeAnalysisStatus.UNAVAILABLE
          ) {
            return;
          }
        }
        await enqueue.requestAnalysis(caseId);
      } catch (error: unknown) {
        Logger.info('proofCodeAnalysis.assign_fallback enqueue failed', {
          eventName: 'proof_code_analysis_assign_fallback_failed',
          caseId,
          reason:
            error instanceof Error
              ? error.message.slice(0, 120)
              : 'enqueue_error',
        });
      }
    })();
  }

  private parseModerationStatusFilter(
    status?: EVerificationCaseStatus | string,
  ): EVerificationCaseStatus | undefined {
    if (status === undefined || status === '') {
      return undefined;
    }
    const normalized = String(status).trim().toUpperCase();
    const allowed = Object.values(EVerificationCaseStatus) as string[];
    if (!allowed.includes(normalized)) {
      throw {
        status: 400,
        errorCode: EErrorCode.FIELD_INVALID,
        message: 'status is invalid',
        details: { field: 'status' },
      } as IThrowedError;
    }
    return normalized as EVerificationCaseStatus;
  }

  private parseModerationScoreFilter(
    params: IParamsListModerationQueue,
  ): Pick<IModerationQueueSearchScope, 'minScore' | 'maxScore' | 'hasAiScore'> {
    const hasAiScore =
      params.hasAiScore === true
        ? true
        : params.hasAiScore === false
          ? false
          : undefined;

    if (hasAiScore === false && (params.minScore !== undefined || params.maxScore !== undefined)) {
      throw {
        status: 400,
        errorCode: EErrorCode.FIELD_INVALID,
        message: 'hasAiScore=false cannot be combined with minScore or maxScore',
        details: { field: 'hasAiScore' },
      } as IThrowedError;
    }

    const minScore = this.parseModerationScoreBound(params.minScore, 'minScore');
    const maxScore = this.parseModerationScoreBound(params.maxScore, 'maxScore');

    if (minScore !== undefined && maxScore !== undefined && minScore > maxScore) {
      throw {
        status: 400,
        errorCode: EErrorCode.FIELD_INVALID,
        message: 'minScore must be less than or equal to maxScore',
        details: { field: 'minScore' },
      } as IThrowedError;
    }

    return { minScore, maxScore, hasAiScore };
  }

  private parseModerationScoreBound(
    value: number | undefined,
    field: string,
  ): number | undefined {
    if (value === undefined) {
      return undefined;
    }
    if (!Number.isFinite(value)) {
      throw {
        status: 400,
        errorCode: EErrorCode.FIELD_INVALID,
        message: `${field} must be a number between 0 and 100`,
        details: { field },
      } as IThrowedError;
    }
    const normalized = Math.floor(value);
    if (normalized < 0 || normalized > 100) {
      throw {
        status: 400,
        errorCode: EErrorCode.FIELD_INVALID,
        message: `${field} must be between 0 and 100`,
        details: { field },
      } as IThrowedError;
    }
    return normalized;
  }

  private parseModerationPagination(params: IParamsListModerationQueue): {
    limit: number;
    offset: number;
  } {
    const requestedLimit = Number(params.limit ?? MODERATION_QUEUE_DEFAULT_LIMIT);
    if (!Number.isFinite(requestedLimit) || requestedLimit <= 0) {
      throw {
        status: 400,
        errorCode: EErrorCode.FIELD_INVALID,
        message: 'limit must be a positive number',
        details: { field: 'limit' },
      } as IThrowedError;
    }
    const limit = Math.min(
      Math.floor(requestedLimit),
      MODERATION_QUEUE_MAX_LIMIT,
    );

    const requestedOffset = Number(params.offset ?? 0);
    if (!Number.isFinite(requestedOffset) || requestedOffset < 0) {
      throw {
        status: 400,
        errorCode: EErrorCode.FIELD_INVALID,
        message: 'offset must be a non-negative number',
        details: { field: 'offset' },
      } as IThrowedError;
    }

    return { limit, offset: Math.floor(requestedOffset) };
  }

  private async buildModerationSearchScope(
    params: IParamsListModerationQueue,
  ): Promise<IModerationQueueSearchScope> {
    const q = params.q?.trim();
    const moderatorId = params.moderatorId?.trim();

    const scope: IModerationQueueSearchScope = {
      q: q || undefined,
      moderatorId: moderatorId || undefined,
    };

    if (!q) {
      return scope;
    }

    const listingIds = new Set<string>();
    const [userIds, titleListingIds] = await Promise.all([
      this.userRepositoryRead.findUserIdsBySearchQuery(q, SEARCH_USER_LIMIT),
      this.listingRepositoryRead.findListingIdsByTitleSearch(
        q,
        SEARCH_LISTING_TITLE_LIMIT,
      ),
    ]);

    titleListingIds.forEach((id) => listingIds.add(id));

    if (userIds.length > 0) {
      const sellerListingIds =
        await this.listingRepositoryRead.findListingIdsBySellerIds(userIds);
      sellerListingIds.forEach((id) => listingIds.add(id));
    }

    if (listingIds.size > 0) {
      scope.listingIds = [...listingIds];
    }

    return scope;
  }

  private async enrichModerationQueueItems(
    cases: IVerificationCase[],
  ): Promise<IModerationQueueItem[]> {
    if (cases.length === 0) {
      return [];
    }

    const listingIds = [...new Set(cases.map((item) => item.listingId))];
    const listings = await this.listingRepositoryRead.findListingsByIds(
      listingIds,
    );
    const listingById = new Map(listings.map((listing) => [listing.id, listing]));

    const sellerIds = [
      ...new Set(
        listings.map((listing) => listing.sellerId).filter(Boolean),
      ),
    ];
    const [users, profiles] = await Promise.all([
      this.userRepositoryRead.findUsersByIds(sellerIds),
      this.profileRepositoryRead.findProfilesByUserIds(sellerIds),
    ]);
    const userById = new Map(users.map((user) => [user.id, user]));
    const profileByUserId = new Map(
      profiles.map((profile) => [profile.userId, profile]),
    );

    return cases.map((verificationCase) => {
      const listing = listingById.get(verificationCase.listingId);
      const sellerId = listing?.sellerId ?? '';
      const user = sellerId ? userById.get(sellerId) : undefined;
      const profile = sellerId ? profileByUserId.get(sellerId) : undefined;
      const publicCase = toPublicVerificationCase(verificationCase);

      return {
        ...publicCase,
        aiAnalysisScore: this.extractAiAnalysisScore(verificationCase.checklist),
        listingTitle: listing?.title ?? verificationCase.listingId,
        listingStatus: listing?.status,
        listingCoverPhotoUrl: this.resolveListingCoverPhoto(listing),
        sellerId,
        sellerDisplayName:
          profile?.displayName?.trim() ||
          user?.fullName ||
          sellerId ||
          'Vendedor desconhecido',
      };
    });
  }

  private extractAiAnalysisScore(
    checklist?: Record<string, unknown>,
  ): number | undefined {
    const aiAnalysis = checklist?.aiAnalysis;
    if (!aiAnalysis || typeof aiAnalysis !== 'object') {
      return undefined;
    }
    const score = (aiAnalysis as { score?: unknown }).score;
    if (typeof score !== 'number' || !Number.isFinite(score)) {
      return undefined;
    }
    return score;
  }

  private resolveListingCoverPhoto(
    listing: IListing | undefined,
  ): string | undefined {
    if (!listing) {
      return undefined;
    }
    return (
      listing.media.coverPhotoUrl ||
      listing.media.photoUrls?.[0] ||
      undefined
    );
  }

  private assertTransition(
    from: EVerificationCaseStatus,
    to: EVerificationCaseStatus,
  ): void {
    const allowed = ALLOWED_TRANSITIONS[from] ?? [];
    if (!allowed.includes(to)) {
      throw {
        status: 409,
        errorCode: EErrorCode.RESOURCE_CONFLICT,
        message: 'Invalid verification case status transition',
        details: { from, to },
      } as IThrowedError;
    }
  }
}
