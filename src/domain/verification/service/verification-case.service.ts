import { IThrowedError } from '@sauvvitech/st-packages';
import { randomUUID } from 'crypto';
import { EErrorCode } from '../../common/errors/enums/EErrorCode';
import { createEventEnvelope } from '../../common/messaging/event-envelope';
import { IEventPublisher } from '../../common/messaging/event-publisher.interface';
import { isBlank } from '../../common/types/required-string';
import { IUserRepositoryRead } from '../../identity/repository/user.repository.read';
import { IProfileRepositoryRead } from '../../identity/repository/profile.repository.read';
import { IListing } from '../../listings/entity/interfaces/listing.interface';
import { IListingRepositoryRead } from '../../listings/repository/listing.repository.read';
import { VerificationCaseServiceEntity } from '../entity/verification-case.entity';
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
import { IVerificationCase } from '../entity/interfaces/verification-case.interface';
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
  IVerificationCaseService,
} from './verification-case.service.interface';
import {
  buildRevisionBaseline,
  normalizeRequiredChanges,
} from '../revision/revision-change.validation';

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
  private readonly listingRepositoryRead: IListingRepositoryRead;
  private readonly userRepositoryRead: IUserRepositoryRead;
  private readonly profileRepositoryRead: IProfileRepositoryRead;
  private readonly sealService: ISealService;
  private readonly eventPublisher: IEventPublisher;

  constructor({
    verificationCaseRepositoryRead,
    verificationCaseRepositoryWrite,
    listingRepositoryRead,
    userRepositoryRead,
    profileRepositoryRead,
    sealService,
    eventPublisher,
  }: IParamsVerificationCaseService) {
    this.verificationCaseRepositoryRead = verificationCaseRepositoryRead;
    this.verificationCaseRepositoryWrite = verificationCaseRepositoryWrite;
    this.listingRepositoryRead = listingRepositoryRead;
    this.userRepositoryRead = userRepositoryRead;
    this.profileRepositoryRead = profileRepositoryRead;
    this.sealService = sealService;
    this.eventPublisher = eventPublisher;
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

    await this.eventPublisher.publish(
      createEventEnvelope({
        eventId: randomUUID(),
        eventType: 'verification.case.submitted',
        aggregateId: created.id,
        producerModule: 'verification',
        correlationId: randomUUID(),
        payload: {
          caseId: created.id,
          listingId: created.listingId,
        },
      }),
    );

    return created;
  }

  async ensureOpenCaseForListing(
    listingId: string,
  ): Promise<IVerificationCase> {
    const openCase =
      await this.verificationCaseRepositoryRead.findOpenCaseByListingId(
        listingId,
      );
    if (openCase) {
      return openCase;
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
          return raced;
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
    return verificationCase;
  }

  async listVerificationCases(
    filter: Partial<IVerificationCase> = {},
  ): Promise<IVerificationCase[]> {
    return this.verificationCaseRepositoryRead.listVerificationCases(filter);
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
    const existing = await this.getVerificationCaseById(id);
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
    return updated;
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

    return updated;
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

    return updated;
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

    return updated;
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

      return {
        ...verificationCase,
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
