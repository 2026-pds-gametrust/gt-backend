import { IThrowedError } from '@sauvvitech/st-packages';
import { createHash, randomUUID } from 'crypto';
import { Logger } from 'traceability';
import {
  assertActorPresent,
  assertOwnerOrAdmin,
  isBackofficeOrAdmin,
} from '../../common/auth/actor-authorization';
import { EErrorCode } from '../../common/errors/enums/EErrorCode';
import {
  createEventEnvelope,
  IEventEnvelope,
} from '../../common/messaging/event-envelope';
import { IEventPublisher } from '../../common/messaging/event-publisher.interface';
import { IActorContext } from '../../common/types/actor-context';
import { IListing } from '../../listings/entity/interfaces/listing.interface';
import { IListingRepositoryRead } from '../../listings/repository/listing.repository.read';
import { IListingRepositoryWrite } from '../../listings/repository/listing.repository.write';
import { EMediaAssetStatus } from '../../media/entity/enums/EMediaAssetStatus';
import { EMediaPurpose } from '../../media/entity/enums/EMediaPurpose';
import { EMediaVariantSize } from '../../media/entity/enums/EMediaVariantSize';
import { IMediaAsset } from '../../media/entity/interfaces/media-asset.interface';
import { isImageContentType, isVideoContentType } from '../../media/entity/media-asset.entity';
import { IMediaAssetRepositoryRead } from '../../media/repository/media-asset.repository.read';
import { IObjectStorage } from '../../media/storage/object-storage.interface';
import { IVerificationCaseRepositoryRead } from '../../verification/repository/verification-case.repository.read';
import { IVerificationCaseRepositoryWrite } from '../../verification/repository/verification-case.repository.write';
import {
  checklistItemsForScope,
  computeAnalysisScore,
  LISTING_ANALYSIS_PROMPT_VERSION,
} from '../analysis/listing-analysis-checklist';
import { EListingAnalysisScope } from '../entity/enums/EListingAnalysisScope';
import { EListingAnalysisStatus } from '../entity/enums/EListingAnalysisStatus';
import {
  IListingAnalysis,
  IListingQualityHints,
  IVerificationAiChecklist,
} from '../entity/interfaces/listing-analysis.interface';
import {
  IListingAnalysisProvider,
  IListingAnalysisMediaPart,
  IParamsListingAnalysisProviderInput,
} from '../provider/listing-analysis.provider.interface';
import { IListingAnalysisRepositoryRead } from '../repository/listing-analysis.repository.read';
import { IListingAnalysisRepositoryWrite } from '../repository/listing-analysis.repository.write';
import {
  IListingAnalysisService,
  IParamsListingAnalysisService,
} from './listing-analysis.service.interface';

export class ListingAnalysisService implements IListingAnalysisService {
  private readonly listingAnalysisRepositoryRead: IListingAnalysisRepositoryRead;
  private readonly listingAnalysisRepositoryWrite: IListingAnalysisRepositoryWrite;
  private readonly listingRepositoryRead: IListingRepositoryRead;
  private readonly listingRepositoryWrite: IListingRepositoryWrite;
  private readonly mediaAssetRepositoryRead: IMediaAssetRepositoryRead;
  private readonly objectStorage: IObjectStorage;
  private readonly verificationCaseRepositoryRead: IVerificationCaseRepositoryRead;
  private readonly verificationCaseRepositoryWrite: IVerificationCaseRepositoryWrite;
  private readonly analysisProvider: IListingAnalysisProvider;
  private readonly eventPublisher: IEventPublisher;
  private readonly analysisEnabled: boolean;
  private readonly maxPhotosToAnalyze: number;
  private readonly maxVideoBytes: number;

  constructor(params: IParamsListingAnalysisService) {
    this.listingAnalysisRepositoryRead = params.listingAnalysisRepositoryRead;
    this.listingAnalysisRepositoryWrite = params.listingAnalysisRepositoryWrite;
    this.listingRepositoryRead = params.listingRepositoryRead;
    this.listingRepositoryWrite = params.listingRepositoryWrite;
    this.mediaAssetRepositoryRead = params.mediaAssetRepositoryRead;
    this.objectStorage = params.objectStorage;
    this.verificationCaseRepositoryRead = params.verificationCaseRepositoryRead;
    this.verificationCaseRepositoryWrite = params.verificationCaseRepositoryWrite;
    this.analysisProvider = params.analysisProvider;
    this.eventPublisher = params.eventPublisher;
    this.analysisEnabled = params.analysisEnabled;
    this.maxPhotosToAnalyze = params.maxPhotosToAnalyze;
    this.maxVideoBytes = params.maxVideoBytes;
  }

  async requestAnalysis(
    listingId: string,
    scope: EListingAnalysisScope,
  ): Promise<IListingAnalysis | null> {
    if (!this.analysisEnabled) {
      return null;
    }

    const listing = await this.listingRepositoryRead.findListingById(listingId);
    if (!listing) {
      Logger.info('listingAnalysis.request skip', {
        eventName: 'listing_analysis_request_skip',
        reason: 'listing_not_found',
        listingId,
      });
      return null;
    }

    const idempotencyKey = this.buildIdempotencyKey(listing, scope);
    const existing =
      await this.listingAnalysisRepositoryRead.findLatestByListingIdAndScope(
        listingId,
        scope,
      );
    if (
      existing &&
      existing.idempotencyKey === idempotencyKey &&
      existing.status === EListingAnalysisStatus.COMPLETED
    ) {
      return existing;
    }

    const pending: IListingAnalysis = {
      id: randomUUID(),
      listingId,
      scope,
      status: EListingAnalysisStatus.PENDING,
      score: 0,
      items: [],
      promptVersion: LISTING_ANALYSIS_PROMPT_VERSION,
      idempotencyKey,
      createdAt: new Date(),
    };

    const created =
      await this.listingAnalysisRepositoryWrite.createListingAnalysis(pending);

    try {
      const mediaInput = await this.loadListingMediaForAnalysis(listing, scope);
      const checklistDefs = checklistItemsForScope(scope);
      const baseInput: IParamsListingAnalysisProviderInput = {
        scope,
        title: listing.title,
        description: listing.description,
        condition: listing.condition,
        photos: mediaInput.photos,
        video: mediaInput.video,
        checklistItemIds: checklistDefs.map((item) => item.id),
      };

      let providerResult;
      try {
        providerResult = await this.analysisProvider.analyze(baseInput);
      } catch (firstError) {
        // SUBMIT includes inline video; Gemini often rejects/times out on MP4.
        // Retry photos-only so moderation still gets a score.
        if (baseInput.video && baseInput.photos.length > 0) {
          Logger.info('listingAnalysis.retry_without_video', {
            eventName: 'listing_analysis_retry_without_video',
            listingId,
            scope,
            reason:
              firstError instanceof Error
                ? firstError.message.slice(0, 120)
                : 'provider_error',
          });
          providerResult = await this.analysisProvider.analyze({
            ...baseInput,
            video: undefined,
          });
        } else {
          throw firstError;
        }
      }

      const score = computeAnalysisScore(providerResult.items);
      const completed: Partial<IListingAnalysis> = {
        status: EListingAnalysisStatus.COMPLETED,
        score,
        items: providerResult.items,
        modelId: providerResult.modelId,
        updatedAt: new Date(),
      };

      const updated = await this.listingAnalysisRepositoryWrite.updateListingAnalysisById(
        created.id,
        completed,
      );
      if (!updated) {
        return null;
      }

      await this.publishAnalyzed(updated);
      return updated;
    } catch (error) {
      Logger.info('listingAnalysis.request unavailable', {
        eventName: 'listing_analysis_unavailable',
        listingId,
        scope,
        reason:
          error instanceof Error ? error.message.slice(0, 120) : 'provider_error',
      });
      const unavailable = await this.listingAnalysisRepositoryWrite.updateListingAnalysisById(
        created.id,
        {
          status: EListingAnalysisStatus.UNAVAILABLE,
          failureReason: 'provider_error',
          updatedAt: new Date(),
        },
      );

      if (scope === EListingAnalysisScope.SUBMIT) {
        await this.applyDraftScoreFallbackToVerificationCase(listingId);
      }

      return unavailable;
    }
  }

  async requestAnalysisForMediaAsset(assetId: string): Promise<void> {
    const listingIds =
      await this.listingRepositoryRead.findListingIdsByMediaAssetId(assetId);
    for (const listingId of listingIds) {
      await this.requestAnalysis(listingId, EListingAnalysisScope.DRAFT);
    }
  }

  async getAnalysisForListing(
    listingId: string,
    actor: IActorContext,
  ): Promise<IListingAnalysis> {
    assertActorPresent(actor);
    const listing = await this.listingRepositoryRead.findListingById(listingId);
    if (!listing) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Listing not found',
        details: { id: listingId },
      } as IThrowedError;
    }

    if (!isBackofficeOrAdmin(actor)) {
      assertOwnerOrAdmin(actor, listing.sellerId);
    }

    const analysis =
      await this.listingAnalysisRepositoryRead.findLatestByListingId(listingId);
    if (!analysis) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Analysis not found',
        details: { listingId },
      } as IThrowedError;
    }

    return analysis;
  }

  async applyAnalysisToListing(
    listingId: string,
    analysisId: string,
  ): Promise<void> {
    const analysis =
      await this.listingAnalysisRepositoryRead.findListingAnalysisById(analysisId);
    if (!analysis || analysis.listingId !== listingId) {
      return;
    }

    const qualityHints: IListingQualityHints = {
      analysisId: analysis.id,
      score: analysis.score,
      status: analysis.status,
      scope: analysis.scope,
      items: analysis.items,
      analyzedAt: (analysis.updatedAt ?? analysis.createdAt).toISOString(),
      modelId: analysis.modelId,
    };

    await this.listingRepositoryWrite.updateListingById(listingId, {
      qualityHints: qualityHints as unknown as Record<string, unknown>,
    });
  }

  async applyAnalysisToVerificationCase(
    listingId: string,
    analysisId: string,
  ): Promise<void> {
    const analysis =
      await this.listingAnalysisRepositoryRead.findListingAnalysisById(analysisId);
    if (
      !analysis ||
      analysis.listingId !== listingId ||
      analysis.scope !== EListingAnalysisScope.SUBMIT ||
      analysis.status !== EListingAnalysisStatus.COMPLETED
    ) {
      return;
    }

    const verificationCase =
      await this.verificationCaseRepositoryRead.findOpenCaseByListingId(listingId);
    if (!verificationCase) {
      return;
    }

    const aiAnalysis: IVerificationAiChecklist = {
      analysisId: analysis.id,
      score: analysis.score,
      items: analysis.items,
      modelId: analysis.modelId,
      promptVersion: analysis.promptVersion,
      analyzedAt: (analysis.updatedAt ?? analysis.createdAt).toISOString(),
    };

    await this.verificationCaseRepositoryWrite.updateVerificationCaseById(
      verificationCase.id,
      {
        checklist: {
          ...(verificationCase.checklist ?? {}),
          aiAnalysis,
        },
      },
    );
  }

  /**
   * When SUBMIT analysis fails, attach the latest COMPLETED DRAFT score so the
   * moderation queue is not left without an AI signal.
   */
  private async applyDraftScoreFallbackToVerificationCase(
    listingId: string,
  ): Promise<void> {
    const draft =
      await this.listingAnalysisRepositoryRead.findLatestByListingIdAndScope(
        listingId,
        EListingAnalysisScope.DRAFT,
      );
    if (!draft || draft.status !== EListingAnalysisStatus.COMPLETED) {
      return;
    }

    const verificationCase =
      await this.verificationCaseRepositoryRead.findOpenCaseByListingId(listingId);
    if (!verificationCase) {
      return;
    }

    const existing = verificationCase.checklist?.aiAnalysis as
      | { score?: unknown }
      | undefined;
    if (existing && typeof existing.score === 'number') {
      return;
    }

    const aiAnalysis: IVerificationAiChecklist = {
      analysisId: draft.id,
      score: draft.score,
      items: draft.items,
      modelId: draft.modelId,
      promptVersion: draft.promptVersion,
      analyzedAt: (draft.updatedAt ?? draft.createdAt).toISOString(),
    };

    await this.verificationCaseRepositoryWrite.updateVerificationCaseById(
      verificationCase.id,
      {
        checklist: {
          ...(verificationCase.checklist ?? {}),
          aiAnalysis,
        },
      },
    );

    Logger.info('listingAnalysis.draft_score_fallback', {
      eventName: 'listing_analysis_draft_score_fallback',
      listingId,
      analysisId: draft.id,
      score: draft.score,
    });
  }

  private buildIdempotencyKey(
    listing: IListing,
    scope: EListingAnalysisScope,
  ): string {
    const payload = [
      listing.id,
      scope,
      listing.title,
      listing.description ?? '',
      listing.condition,
      ...(listing.media.assetIds ?? []),
      listing.media.videoAssetId ?? '',
    ].join('|');
    return createHash('sha256').update(payload).digest('hex').slice(0, 32);
  }

  private async loadListingMediaForAnalysis(
    listing: IListing,
    scope: EListingAnalysisScope,
  ): Promise<{ photos: IListingAnalysisMediaPart[]; video?: IListingAnalysisMediaPart }> {
    const photos: IListingAnalysisMediaPart[] = [];
    const assetIds = (listing.media.assetIds ?? []).slice(0, this.maxPhotosToAnalyze);

    for (const assetId of assetIds) {
      const part = await this.loadAssetPart(assetId, 'photo');
      if (part) {
        photos.push(part);
      }
    }

    let video: IListingAnalysisMediaPart | undefined;
    if (
      scope === EListingAnalysisScope.SUBMIT &&
      listing.media.videoAssetId?.trim()
    ) {
      video = await this.loadAssetPart(
        listing.media.videoAssetId,
        'video',
        this.maxVideoBytes,
      );
    }

    return { photos, video };
  }

  private async loadAssetPart(
    assetId: string,
    label: string,
    maxBytes?: number,
  ): Promise<IListingAnalysisMediaPart | undefined> {
    const asset = await this.mediaAssetRepositoryRead.findMediaAssetById(assetId);
    if (!this.isAnalyzableListingAsset(asset)) {
      return undefined;
    }

    const storageKey = this.resolveStorageKey(asset);
    if (!storageKey) {
      return undefined;
    }

    const objectBytes = await this.objectStorage.getObject({
      bucketClass: asset.bucketClass,
      key: storageKey,
    });
    if (!objectBytes) {
      return undefined;
    }

    if (maxBytes !== undefined && objectBytes.byteLength > maxBytes) {
      return undefined;
    }

    return {
      mimeType: asset.contentType,
      data: objectBytes,
      label,
    };
  }

  private isAnalyzableListingAsset(asset: IMediaAsset | null): asset is IMediaAsset {
    if (!asset) {
      return false;
    }
    if (asset.purpose !== EMediaPurpose.LISTING) {
      return false;
    }
    if (asset.status !== EMediaAssetStatus.READY) {
      return false;
    }
    return (
      isImageContentType(asset.contentType) ||
      isVideoContentType(asset.contentType)
    );
  }

  private resolveStorageKey(asset: IMediaAsset): string | undefined {
    if (isVideoContentType(asset.contentType)) {
      const original = asset.variants.find(
        (variant) => variant.size === EMediaVariantSize.ORIGINAL,
      );
      return original?.storageKey ?? asset.originalKey;
    }

    const full =
      asset.variants.find((variant) => variant.size === EMediaVariantSize.FULL) ??
      asset.variants.find((variant) => variant.size === EMediaVariantSize.CARD);
    return full?.storageKey ?? asset.originalKey;
  }

  private async publishAnalyzed(analysis: IListingAnalysis): Promise<void> {
    await this.eventPublisher.publish(
      createEventEnvelope({
        eventId: randomUUID(),
        eventType: 'ai.listing.analyzed',
        aggregateId: analysis.listingId,
        producerModule: 'ai',
        correlationId: randomUUID(),
        payload: {
          analysisId: analysis.id,
          listingId: analysis.listingId,
          scope: analysis.scope,
          status: analysis.status,
          score: analysis.score,
        },
      }),
    );
  }

  async handleAnalyzedEvent(envelope: IEventEnvelope): Promise<void> {
    const payload = envelope.payload as {
      analysisId?: string;
      listingId?: string;
      scope?: EListingAnalysisScope;
      status?: EListingAnalysisStatus;
    };

    if (
      !payload.analysisId ||
      !payload.listingId ||
      payload.status !== EListingAnalysisStatus.COMPLETED
    ) {
      return;
    }

    await this.applyAnalysisToListing(payload.listingId, payload.analysisId);

    if (payload.scope === EListingAnalysisScope.SUBMIT) {
      await this.applyAnalysisToVerificationCase(
        payload.listingId,
        payload.analysisId,
      );
    }
  }
}
