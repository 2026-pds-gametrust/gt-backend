import { IThrowedError } from '@sauvvitech/st-packages';
import { createHash, randomUUID } from 'crypto';
import { Logger } from 'traceability';
import {
  assertActorPresent,
  isBackofficeOrAdmin,
} from '../../common/auth/actor-authorization';
import { EErrorCode } from '../../common/errors/enums/EErrorCode';
import { createEventEnvelope } from '../../common/messaging/event-envelope';
import { IActorContext } from '../../common/types/actor-context';
import { EEvidenceType } from '../../verification/entity/enums/EEvidenceType';
import { IEvidenceItem } from '../../verification/entity/interfaces/evidence-item.interface';
import { IVerificationCase } from '../../verification/entity/interfaces/verification-case.interface';
import { EMediaAssetStatus } from '../../media/entity/enums/EMediaAssetStatus';
import { EMediaPurpose } from '../../media/entity/enums/EMediaPurpose';
import { EMediaVariantSize } from '../../media/entity/enums/EMediaVariantSize';
import { IMediaAsset } from '../../media/entity/interfaces/media-asset.interface';
import {
  isImageContentType,
  isVideoContentType,
} from '../../media/entity/media-asset.entity';
import {
  computeProofCodeAnalysisScore,
  PROOF_CODE_ANALYSIS_PROMPT_VERSION,
  proofCodeChecklistItems,
} from '../analysis/proof-code-analysis-checklist';
import { EProofCodeAnalysisStatus } from '../entity/enums/EProofCodeAnalysisStatus';
import {
  IProofCodeAnalysis,
  IProofCodeAnalysisSnapshot,
} from '../entity/interfaces/proof-code-analysis.interface';
import {
  IProofCodeAnalysisMediaPart,
  IParamsProofCodeAnalysisProviderInput,
} from '../provider/proof-code-analysis.provider.interface';
import {
  IParamsProofCodeAnalysisService,
  IParamsRequestProofCodeAnalysis,
  IProofCodeAnalysisService,
} from './proof-code-analysis.service.interface';

export class ProofCodeAnalysisService implements IProofCodeAnalysisService {
  private readonly proofCodeAnalysisRepositoryRead: IParamsProofCodeAnalysisService['proofCodeAnalysisRepositoryRead'];
  private readonly proofCodeAnalysisRepositoryWrite: IParamsProofCodeAnalysisService['proofCodeAnalysisRepositoryWrite'];
  private readonly verificationCaseRepositoryRead: IParamsProofCodeAnalysisService['verificationCaseRepositoryRead'];
  private readonly verificationCaseRepositoryWrite: IParamsProofCodeAnalysisService['verificationCaseRepositoryWrite'];
  private readonly evidenceItemRepositoryRead: IParamsProofCodeAnalysisService['evidenceItemRepositoryRead'];
  private readonly listingRepositoryRead: IParamsProofCodeAnalysisService['listingRepositoryRead'];
  private readonly mediaAssetRepositoryRead: IParamsProofCodeAnalysisService['mediaAssetRepositoryRead'];
  private readonly objectStorage: IParamsProofCodeAnalysisService['objectStorage'];
  private readonly analysisProvider: IParamsProofCodeAnalysisService['analysisProvider'];
  private readonly eventPublisher: IParamsProofCodeAnalysisService['eventPublisher'];
  private readonly analysisEnabled: boolean;
  private readonly maxPhotosToAnalyze: number;
  private readonly maxVideoBytes: number;

  constructor(params: IParamsProofCodeAnalysisService) {
    this.proofCodeAnalysisRepositoryRead =
      params.proofCodeAnalysisRepositoryRead;
    this.proofCodeAnalysisRepositoryWrite =
      params.proofCodeAnalysisRepositoryWrite;
    this.verificationCaseRepositoryRead = params.verificationCaseRepositoryRead;
    this.verificationCaseRepositoryWrite =
      params.verificationCaseRepositoryWrite;
    this.evidenceItemRepositoryRead = params.evidenceItemRepositoryRead;
    this.listingRepositoryRead = params.listingRepositoryRead;
    this.mediaAssetRepositoryRead = params.mediaAssetRepositoryRead;
    this.objectStorage = params.objectStorage;
    this.analysisProvider = params.analysisProvider;
    this.eventPublisher = params.eventPublisher;
    this.analysisEnabled = params.analysisEnabled;
    this.maxPhotosToAnalyze = params.maxPhotosToAnalyze;
    this.maxVideoBytes = params.maxVideoBytes;
  }

  async requestAnalysis(
    caseId: string,
    opts?: IParamsRequestProofCodeAnalysis,
  ): Promise<IProofCodeAnalysis | null> {
    if (!this.analysisEnabled) {
      return null;
    }

    const force = opts?.force === true;
    const verificationCase =
      await this.verificationCaseRepositoryRead.findVerificationCaseById(
        caseId,
      );
    if (!verificationCase) {
      Logger.info('proofCodeAnalysis.request skip', {
        eventName: 'proof_code_analysis_request_skip',
        reason: 'case_not_found',
        caseId,
      });
      return null;
    }

    const evidence = await this.evidenceItemRepositoryRead.listByCaseId(caseId);
    const mediaEvidence = evidence.filter(
      (item) =>
        item.type === EEvidenceType.PHOTO || item.type === EEvidenceType.VIDEO,
    );
    const idempotencyKey = this.buildIdempotencyKey(
      verificationCase,
      mediaEvidence,
    );

    if (!force) {
      const existing =
        await this.proofCodeAnalysisRepositoryRead.findLatestByCaseId(caseId);
      if (
        existing &&
        existing.idempotencyKey === idempotencyKey &&
        (existing.status === EProofCodeAnalysisStatus.COMPLETED ||
          existing.status === EProofCodeAnalysisStatus.PENDING)
      ) {
        return existing;
      }
    }

    const pending: IProofCodeAnalysis = {
      id: randomUUID(),
      caseId: verificationCase.id,
      listingId: verificationCase.listingId,
      status: EProofCodeAnalysisStatus.PENDING,
      score: 0,
      items: [],
      promptVersion: PROOF_CODE_ANALYSIS_PROMPT_VERSION,
      idempotencyKey,
      createdAt: new Date(),
    };

    const created =
      await this.proofCodeAnalysisRepositoryWrite.createProofCodeAnalysis(
        pending,
      );

    try {
      const mediaInput = await this.loadEvidenceMediaForAnalysis(mediaEvidence);
      const checklistDefs = proofCodeChecklistItems();
      const providerInput: IParamsProofCodeAnalysisProviderInput = {
        caseId: verificationCase.id,
        photos: mediaInput.photos,
        video: mediaInput.video,
        checklistItemIds: checklistDefs.map((item) => item.id),
      };

      const providerResult = await this.analysisProvider.analyze(providerInput);
      const score = computeProofCodeAnalysisScore(providerResult.items);
      const completed: Partial<IProofCodeAnalysis> = {
        status: EProofCodeAnalysisStatus.COMPLETED,
        score,
        items: providerResult.items,
        modelId: providerResult.modelId,
        updatedAt: new Date(),
      };

      const updated =
        await this.proofCodeAnalysisRepositoryWrite.updateProofCodeAnalysisById(
          created.id,
          completed,
        );
      if (!updated) {
        return null;
      }

      await this.applyAnalysisToVerificationCase(
        verificationCase.id,
        updated.id,
      );
      await this.publishAnalyzed(updated);
      return updated;
    } catch (error) {
      Logger.info('proofCodeAnalysis.request unavailable', {
        eventName: 'proof_code_analysis_unavailable',
        caseId: verificationCase.id,
        listingId: verificationCase.listingId,
        analysisId: created.id,
        reason:
          error instanceof Error
            ? error.message.slice(0, 120)
            : 'provider_error',
      });
      const unavailable =
        await this.proofCodeAnalysisRepositoryWrite.updateProofCodeAnalysisById(
          created.id,
          {
            status: EProofCodeAnalysisStatus.UNAVAILABLE,
            failureReason: 'provider_error',
            updatedAt: new Date(),
          },
        );

      if (unavailable) {
        await this.applyAnalysisToVerificationCase(
          verificationCase.id,
          unavailable.id,
        );
        await this.publishAnalyzed(unavailable);
      }

      return unavailable;
    }
  }

  async getAnalysisForCase(
    caseId: string,
    actor: IActorContext,
  ): Promise<IProofCodeAnalysis> {
    assertActorPresent(actor);
    if (!isBackofficeOrAdmin(actor)) {
      throw {
        status: 403,
        errorCode: EErrorCode.FIELD_INVALID,
        message: 'Only BACKOFFICE/ADMIN may read proof-code analysis',
        details: { caseId },
      } as IThrowedError;
    }

    const verificationCase =
      await this.verificationCaseRepositoryRead.findVerificationCaseById(
        caseId,
      );
    if (!verificationCase) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Verification case not found',
        details: { caseId },
      } as IThrowedError;
    }

    const analysis =
      await this.proofCodeAnalysisRepositoryRead.findLatestByCaseId(caseId);
    if (!analysis) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Proof-code analysis not found',
        details: { caseId },
      } as IThrowedError;
    }

    return analysis;
  }

  async assertModeratorMayReanalyze(
    caseId: string,
    actor: IActorContext,
  ): Promise<void> {
    assertActorPresent(actor);
    if (!isBackofficeOrAdmin(actor)) {
      throw {
        status: 403,
        errorCode: EErrorCode.FIELD_INVALID,
        message: 'Only BACKOFFICE/ADMIN may reanalyze proof-code',
        details: { caseId },
      } as IThrowedError;
    }

    const verificationCase =
      await this.verificationCaseRepositoryRead.findVerificationCaseById(
        caseId,
      );
    if (!verificationCase) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Verification case not found',
        details: { caseId },
      } as IThrowedError;
    }
  }

  async requestForcedAnalysisForModerator(
    caseId: string,
    actor: IActorContext,
  ): Promise<IProofCodeAnalysis | null> {
    await this.assertModeratorMayReanalyze(caseId, actor);
    return this.requestAnalysis(caseId, { force: true });
  }

  async applyAnalysisToVerificationCase(
    caseId: string,
    analysisId: string,
  ): Promise<void> {
    const analysis =
      await this.proofCodeAnalysisRepositoryRead.findProofCodeAnalysisById(
        analysisId,
      );
    if (
      !analysis ||
      analysis.caseId !== caseId ||
      (analysis.status !== EProofCodeAnalysisStatus.COMPLETED &&
        analysis.status !== EProofCodeAnalysisStatus.UNAVAILABLE)
    ) {
      return;
    }

    const verificationCase =
      await this.verificationCaseRepositoryRead.findVerificationCaseById(
        caseId,
      );
    if (!verificationCase) {
      return;
    }

    const proofCodeAnalysis: IProofCodeAnalysisSnapshot = {
      analysisId: analysis.id,
      status: analysis.status,
      items: analysis.items,
      score: analysis.score,
      modelId: analysis.modelId,
      promptVersion: analysis.promptVersion,
      analyzedAt: (analysis.updatedAt ?? analysis.createdAt).toISOString(),
    };

    await this.verificationCaseRepositoryWrite.setChecklistProofCodeAnalysis(
      caseId,
      proofCodeAnalysis,
    );
  }

  private buildIdempotencyKey(
    verificationCase: IVerificationCase,
    mediaEvidence: IEvidenceItem[],
  ): string {
    const fingerprint = mediaEvidence
      .map(
        (item) =>
          `${item.id}:${item.type}:${item.assetId ?? ''}:${item.contentHash ?? item.storageKey}`,
      )
      .sort()
      .join(',');
    const payload = [
      verificationCase.id,
      PROOF_CODE_ANALYSIS_PROMPT_VERSION,
      fingerprint,
    ].join('|');
    return createHash('sha256').update(payload).digest('hex').slice(0, 32);
  }

  private async loadEvidenceMediaForAnalysis(
    mediaEvidence: IEvidenceItem[],
  ): Promise<{
    photos: IProofCodeAnalysisMediaPart[];
    video?: IProofCodeAnalysisMediaPart;
  }> {
    const photos: IProofCodeAnalysisMediaPart[] = [];
    let video: IProofCodeAnalysisMediaPart | undefined;

    const photosEvidence = mediaEvidence
      .filter((item) => item.type === EEvidenceType.PHOTO)
      .slice(0, this.maxPhotosToAnalyze);
    for (const item of photosEvidence) {
      const part = await this.loadEvidenceAssetPart(item, 'photo');
      if (part) {
        photos.push(part);
      }
    }

    const videoEvidence = mediaEvidence.find(
      (item) => item.type === EEvidenceType.VIDEO,
    );
    if (videoEvidence) {
      video = await this.loadEvidenceAssetPart(
        videoEvidence,
        'video',
        this.maxVideoBytes,
      );
    }

    return { photos, video };
  }

  private async loadEvidenceAssetPart(
    evidence: IEvidenceItem,
    label: string,
    maxBytes?: number,
  ): Promise<IProofCodeAnalysisMediaPart | undefined> {
    const assetId = evidence.assetId?.trim();
    if (!assetId) {
      return undefined;
    }

    const asset =
      await this.mediaAssetRepositoryRead.findMediaAssetById(assetId);
    if (!this.isAnalyzableEvidenceAsset(asset)) {
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

  private isAnalyzableEvidenceAsset(
    asset: IMediaAsset | null,
  ): asset is IMediaAsset {
    if (!asset) {
      return false;
    }
    if (asset.purpose !== EMediaPurpose.EVIDENCE) {
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

  private async publishAnalyzed(analysis: IProofCodeAnalysis): Promise<void> {
    await this.eventPublisher.publish(
      createEventEnvelope({
        eventId: randomUUID(),
        eventType: 'ai.proof_code.analyzed',
        aggregateId: analysis.caseId,
        producerModule: 'ai',
        correlationId: randomUUID(),
        payload: {
          caseId: analysis.caseId,
          listingId: analysis.listingId,
          analysisId: analysis.id,
          status: analysis.status,
        },
      }),
    );
  }
}
