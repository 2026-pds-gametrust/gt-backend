import { IThrowedError } from '@sauvvitech/st-packages';
import { randomUUID } from 'crypto';
import { Logger } from 'traceability';
import {
  assertActorPresent,
  assertOwnerOrAdmin,
  isBackofficeOrAdmin,
} from '../../common/auth/actor-authorization';
import { EErrorCode } from '../../common/errors/enums/EErrorCode';
import { createEventEnvelope } from '../../common/messaging/event-envelope';
import { IEventPublisher } from '../../common/messaging/event-publisher.interface';
import { IActorContext } from '../../common/types/actor-context';
import { IParamsAssertAttachableAsset } from '../client/media.client';
import { EMediaAssetStatus } from '../entity/enums/EMediaAssetStatus';
import { EMediaBucketClass } from '../entity/enums/EMediaBucketClass';
import { EMediaPurpose } from '../entity/enums/EMediaPurpose';
import { EMediaVariantFormat } from '../entity/enums/EMediaVariantFormat';
import { EMediaVariantSize } from '../entity/enums/EMediaVariantSize';
import {
  IMediaAsset,
  IMediaVariant,
} from '../entity/interfaces/media-asset.interface';
import {
  isAllowedMediaContentType,
  isImageContentType,
  isMp4Buffer,
  isVideoContentType,
  maxBytesForContentType,
  MEDIA_MAX_DIMENSION,
  MEDIA_MIN_DIMENSION,
  MediaAssetServiceEntity,
} from '../entity/media-asset.entity';
import { IMediaOwnershipLookup } from '../ownership/media-ownership-lookup.interface';
import { IImageProcessor } from '../processing/image-processor.interface';
import { IMediaAssetRepositoryRead } from '../repository/media-asset.repository.read';
import { IMediaAssetRepositoryWrite } from '../repository/media-asset.repository.write';
import { IObjectStorage } from '../storage/object-storage.interface';
import {
  IMediaAssetService,
  IMediaAssetView,
  IMediaContentGrant,
  IMediaUploadGrant,
  IParamsCreateMediaUpload,
  IParamsMediaAssetService,
} from './media-asset.service.interface';

export class MediaAssetService implements IMediaAssetService {
  private readonly mediaAssetRepositoryRead: IMediaAssetRepositoryRead;
  private readonly mediaAssetRepositoryWrite: IMediaAssetRepositoryWrite;
  private readonly objectStorage: IObjectStorage;
  private readonly imageProcessor: IImageProcessor;
  private readonly eventPublisher: IEventPublisher;
  private readonly ownershipLookup: IMediaOwnershipLookup;
  private readonly publicBaseUrl: string;
  private readonly putUrlTtlSeconds: number;
  private readonly getUrlTtlSeconds: number;

  constructor({
    mediaAssetRepositoryRead,
    mediaAssetRepositoryWrite,
    objectStorage,
    imageProcessor,
    eventPublisher,
    ownershipLookup,
    publicBaseUrl,
    putUrlTtlSeconds,
    getUrlTtlSeconds,
  }: IParamsMediaAssetService) {
    this.mediaAssetRepositoryRead = mediaAssetRepositoryRead;
    this.mediaAssetRepositoryWrite = mediaAssetRepositoryWrite;
    this.objectStorage = objectStorage;
    this.imageProcessor = imageProcessor;
    this.eventPublisher = eventPublisher;
    this.ownershipLookup = ownershipLookup;
    this.publicBaseUrl = publicBaseUrl.replace(/\/$/, '');
    this.putUrlTtlSeconds = putUrlTtlSeconds;
    this.getUrlTtlSeconds = getUrlTtlSeconds;
  }

  async createUpload(
    params: IParamsCreateMediaUpload,
    actor: IActorContext,
  ): Promise<IMediaUploadGrant> {
    await this.assertCanCreateUpload(params, actor);

    const contentType = String(params.contentType ?? '')
      .trim()
      .toLowerCase();
    const byteSize = Number(params.byteSize);

    if (!isAllowedMediaContentType(contentType)) {
      throw this.fieldInvalid('contentType', 'Unsupported media content type');
    }
    if (isVideoContentType(contentType) && params.purpose !== EMediaPurpose.LISTING) {
      throw this.fieldInvalid(
        'contentType',
        'Video uploads are only allowed for LISTING purpose',
      );
    }
    if (!Number.isInteger(byteSize) || byteSize < 1) {
      throw this.fieldInvalid('byteSize', 'byteSize must be a positive integer');
    }
    if (byteSize > maxBytesForContentType(contentType)) {
      throw this.fieldInvalid('byteSize', 'byteSize exceeds maximum');
    }

    const id = params.id?.trim() || randomUUID();
    const purpose = params.purpose;
    const ownerId = String(params.ownerId).trim();
    const bucketClass =
      purpose === EMediaPurpose.EVIDENCE
        ? EMediaBucketClass.RESTRICTED
        : EMediaBucketClass.PUBLIC;
    const originalKey = this.buildOriginalKey(purpose, ownerId, id);

    const entity = new MediaAssetServiceEntity({
      id,
      purpose,
      ownerId,
      status: EMediaAssetStatus.PENDING_UPLOAD,
      contentType,
      byteSize,
      originalKey,
      bucketClass,
      variants: [],
      createdAt: new Date(),
    });

    const asset = await this.mediaAssetRepositoryWrite.createMediaAsset(entity);
    let upload;
    try {
      upload = await this.objectStorage.createPresignedPut({
        bucketClass,
        key: originalKey,
        contentType,
        contentLength: byteSize,
        expiresSeconds: this.putUrlTtlSeconds,
      });
    } catch {
      Logger.error(
        JSON.stringify({
          eventName: 'media_upload_presign_failed',
          eventData: { assetId: asset.id, purpose: asset.purpose },
        }),
      );
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
        message: 'Object storage is unavailable',
      } as IThrowedError;
    }

    Logger.info('Media upload grant created', {
      eventName: 'media_upload_created',
      eventData: { assetId: asset.id, purpose: asset.purpose },
    });

    return { asset, upload };
  }

  async completeUpload(
    id: string,
    actor: IActorContext,
  ): Promise<IMediaAsset> {
    const asset = await this.getOwnedAsset(id, actor);

    if (asset.status !== EMediaAssetStatus.PENDING_UPLOAD) {
      return asset;
    }

    const head = await this.objectStorage.headObject({
      bucketClass: asset.bucketClass,
      key: asset.originalKey,
    });
    if (!head) {
      throw this.fieldInvalid('object', 'Uploaded object was not found');
    }
    if (head.contentLength > maxBytesForContentType(asset.contentType)) {
      throw this.fieldInvalid('object', 'Uploaded object exceeds maximum size');
    }

    const updated = await this.mediaAssetRepositoryWrite.updateMediaAssetById(
      id,
      {
        status: EMediaAssetStatus.UPLOADED,
        byteSize: head.contentLength,
        updatedAt: new Date(),
      },
    );
    if (!updated) {
      throw this.notFound(id);
    }

    await this.eventPublisher.publish(
      createEventEnvelope({
        eventId: randomUUID(),
        eventType: 'media.asset.uploaded',
        aggregateId: updated.id,
        producerModule: 'media',
        correlationId: actor.correlationId ?? randomUUID(),
        payload: {
          assetId: updated.id,
          purpose: updated.purpose,
          ownerId: updated.ownerId,
        },
      }),
    );

    Logger.info('Media upload completed', {
      eventName: 'media_upload_completed',
      eventData: { assetId: updated.id, purpose: updated.purpose },
    });

    const afterProcess =
      await this.mediaAssetRepositoryRead.findMediaAssetById(id);
    return afterProcess ?? updated;
  }

  async processUploadedAsset(id: string): Promise<IMediaAsset> {
    const existing = await this.requireAsset(id);

    if (existing.status === EMediaAssetStatus.READY) {
      return existing;
    }
    if (existing.status === EMediaAssetStatus.FAILED) {
      return existing;
    }
    if (existing.status === EMediaAssetStatus.PROCESSING) {
      return existing;
    }
    if (existing.status !== EMediaAssetStatus.UPLOADED) {
      throw this.fieldInvalid('status', 'Asset is not ready to process');
    }

    const processing = await this.mediaAssetRepositoryWrite.updateMediaAssetById(
      id,
      { status: EMediaAssetStatus.PROCESSING, updatedAt: new Date() },
    );
    if (!processing) {
      throw this.notFound(id);
    }

    try {
      const original = await this.objectStorage.getObject({
        bucketClass: processing.bucketClass,
        key: processing.originalKey,
      });
      if (!original) {
        throw new Error('original object missing');
      }

      const variants = isVideoContentType(processing.contentType)
        ? await this.processVideoVariants(processing, original)
        : await this.processImageVariants(processing, original);

      const ready = await this.mediaAssetRepositoryWrite.updateMediaAssetById(
        id,
        {
          status: EMediaAssetStatus.READY,
          variants,
          failureReason: undefined,
          updatedAt: new Date(),
        },
      );
      if (!ready) {
        throw this.notFound(id);
      }

      await this.publishProcessed(ready);
      return ready;
    } catch (error) {
      const failed = await this.mediaAssetRepositoryWrite.updateMediaAssetById(
        id,
        {
          status: EMediaAssetStatus.FAILED,
          failureReason: 'processing_failed',
          updatedAt: new Date(),
        },
      );
      Logger.info('Media asset processing failed', {
        eventName: 'media_asset_processed',
        eventData: {
          assetId: id,
          purpose: existing.purpose,
          status: EMediaAssetStatus.FAILED,
        },
      });
      if (failed) {
        await this.publishProcessed(failed);
        return failed;
      }
      throw error;
    }
  }

  async getMediaAssetView(
    id: string,
    actor: IActorContext,
  ): Promise<IMediaAssetView> {
    const asset = await this.getReadableAsset(id, actor);
    return this.toView(asset);
  }

  async getContentGrant(
    id: string,
    actor: IActorContext,
  ): Promise<IMediaContentGrant> {
    const asset = await this.getOwnedAsset(id, actor);
    const grant = await this.objectStorage.createPresignedGet({
      bucketClass: asset.bucketClass,
      key: asset.originalKey,
      expiresSeconds: this.getUrlTtlSeconds,
    });
    return { url: grant.url, expiresAt: grant.expiresAt };
  }

  async getReadyAsset(assetId: string): Promise<IMediaAsset | null> {
    const asset = await this.mediaAssetRepositoryRead.findMediaAssetById(
      assetId,
    );
    if (!asset || asset.status !== EMediaAssetStatus.READY) {
      return null;
    }
    return asset;
  }

  async resolvePublicVariantUrls(assetId: string): Promise<string[]> {
    const asset = await this.getReadyAsset(assetId);
    if (!asset || asset.bucketClass !== EMediaBucketClass.PUBLIC) {
      return [];
    }
    if (!isImageContentType(asset.contentType)) {
      return [];
    }
    return asset.variants
      .filter(
        (variant) =>
          variant.format === EMediaVariantFormat.WEBP && variant.publicUrl,
      )
      .sort((left, right) => left.size.localeCompare(right.size))
      .map((variant) => variant.publicUrl as string);
  }

  async resolvePublicVideoUrl(assetId: string): Promise<string | null> {
    const asset = await this.getReadyAsset(assetId);
    if (!asset || asset.bucketClass !== EMediaBucketClass.PUBLIC) {
      return null;
    }
    if (!isVideoContentType(asset.contentType)) {
      return null;
    }
    const videoVariant = asset.variants.find(
      (variant) =>
        variant.format === EMediaVariantFormat.MP4 &&
        variant.size === EMediaVariantSize.ORIGINAL &&
        variant.publicUrl,
    );
    return videoVariant?.publicUrl ?? null;
  }

  async assertAttachableAsset(
    params: IParamsAssertAttachableAsset,
  ): Promise<IMediaAsset> {
    const asset = await this.getReadyAsset(params.assetId);
    if (!asset) {
      throw {
        status: 400,
        errorCode: EErrorCode.FIELD_INVALID,
        message: 'Media asset is not ready',
        details: { assetId: params.assetId },
      } as IThrowedError;
    }
    if (asset.purpose !== params.purpose) {
      throw this.fieldInvalid('assetId', 'Media asset purpose does not match');
    }
    if (asset.ownerId !== params.ownerId) {
      throw {
        status: 403,
        errorCode: EErrorCode.FIELD_INVALID,
        message: 'Media asset owner does not match',
        details: { assetId: params.assetId },
      } as IThrowedError;
    }
    return asset;
  }

  private async assertCanCreateUpload(
    params: IParamsCreateMediaUpload,
    actor: IActorContext,
  ): Promise<void> {
    assertActorPresent(actor);
    const ownerId = String(params.ownerId ?? '').trim();
    if (!ownerId) {
      throw this.fieldInvalid('ownerId', 'ownerId is required');
    }

    if (params.purpose === EMediaPurpose.PRODUCT) {
      if (!isBackofficeOrAdmin(actor)) {
        throw {
          status: 403,
          errorCode: EErrorCode.FIELD_INVALID,
          message: 'Forbidden: product media requires backoffice or admin',
        } as IThrowedError;
      }
      return;
    }

    if (params.purpose === EMediaPurpose.LISTING) {
      assertOwnerOrAdmin(actor, ownerId);
      return;
    }

    if (params.purpose === EMediaPurpose.EVIDENCE) {
      const sellerId =
        await this.ownershipLookup.findEvidenceSellerId(ownerId);
      if (!sellerId) {
        throw {
          status: 404,
          errorCode: EErrorCode.RESOURCE_NOT_FOUND,
          message: 'Verification case not found',
          details: { caseId: ownerId },
        } as IThrowedError;
      }
      assertOwnerOrAdmin(actor, sellerId);
      return;
    }

    throw this.fieldInvalid('purpose', 'purpose is invalid');
  }

  private async getOwnedAsset(
    id: string,
    actor: IActorContext,
  ): Promise<IMediaAsset> {
    const asset = await this.requireAsset(id);
    if (asset.purpose === EMediaPurpose.EVIDENCE) {
      const sellerId = await this.ownershipLookup.findEvidenceSellerId(
        asset.ownerId,
      );
      if (!sellerId) {
        throw this.notFound(id);
      }
      assertOwnerOrAdmin(actor, sellerId);
      return asset;
    }
    if (asset.purpose === EMediaPurpose.PRODUCT) {
      assertActorPresent(actor);
      if (!isBackofficeOrAdmin(actor)) {
        throw {
          status: 403,
          errorCode: EErrorCode.FIELD_INVALID,
          message: 'Forbidden: actor is not the resource owner',
        } as IThrowedError;
      }
      return asset;
    }
    assertOwnerOrAdmin(actor, asset.ownerId);
    return asset;
  }

  private async getReadableAsset(
    id: string,
    actor: IActorContext,
  ): Promise<IMediaAsset> {
    const asset = await this.requireAsset(id);
    if (asset.purpose === EMediaPurpose.EVIDENCE) {
      return this.getOwnedAsset(id, actor);
    }
    assertActorPresent(actor);
    return asset;
  }

  private async requireAsset(id: string): Promise<IMediaAsset> {
    const asset =
      await this.mediaAssetRepositoryRead.findMediaAssetById(id);
    if (!asset) {
      throw this.notFound(id);
    }
    return asset;
  }

  private toView(asset: IMediaAsset): IMediaAssetView {
    const isRestricted = asset.purpose === EMediaPurpose.EVIDENCE;
    return {
      id: asset.id,
      purpose: asset.purpose,
      ownerId: asset.ownerId,
      status: asset.status,
      contentType: asset.contentType,
      byteSize: asset.byteSize,
      variants: asset.variants.map((variant) => ({
        size: variant.size,
        format: variant.format,
        width: variant.width,
        height: variant.height,
        byteSize: variant.byteSize,
        ...(isRestricted ? {} : { publicUrl: variant.publicUrl }),
      })),
      createdAt: asset.createdAt,
      updatedAt: asset.updatedAt,
    };
  }

  private async processImageVariants(
    processing: IMediaAsset,
    original: Buffer,
  ): Promise<IMediaVariant[]> {
    const inspected = await this.imageProcessor.inspect(original);
    this.assertDimensions(inspected.width, inspected.height);

    const processed = await this.imageProcessor.process(original);
    const variants: IMediaVariant[] = [];

    for (const variant of processed) {
      const storageKey = this.buildVariantKey(
        processing.purpose,
        processing.ownerId,
        processing.id,
        variant.size,
        variant.format,
      );
      await this.objectStorage.putObject({
        bucketClass: processing.bucketClass,
        key: storageKey,
        body: variant.buffer,
        contentType: variant.contentType,
      });
      variants.push({
        size: variant.size,
        format: variant.format,
        storageKey,
        width: variant.width,
        height: variant.height,
        byteSize: variant.buffer.length,
        publicUrl:
          processing.bucketClass === EMediaBucketClass.PUBLIC
            ? `${this.publicBaseUrl}/${storageKey}`
            : undefined,
      });
    }
    return variants;
  }

  private async processVideoVariants(
    processing: IMediaAsset,
    original: Buffer,
  ): Promise<IMediaVariant[]> {
    if (!isMp4Buffer(original)) {
      throw new Error('invalid mp4 magic bytes');
    }
    const storageKey = this.buildVariantKey(
      processing.purpose,
      processing.ownerId,
      processing.id,
      EMediaVariantSize.ORIGINAL,
      EMediaVariantFormat.MP4,
    );
    await this.objectStorage.putObject({
      bucketClass: processing.bucketClass,
      key: storageKey,
      body: original,
      contentType: 'video/mp4',
    });
    return [
      {
        size: EMediaVariantSize.ORIGINAL,
        format: EMediaVariantFormat.MP4,
        storageKey,
        width: 0,
        height: 0,
        byteSize: original.length,
        publicUrl:
          processing.bucketClass === EMediaBucketClass.PUBLIC
            ? `${this.publicBaseUrl}/${storageKey}`
            : undefined,
      },
    ];
  }

  private buildOriginalKey(
    purpose: EMediaPurpose,
    ownerId: string,
    assetId: string,
  ): string {
    if (purpose === EMediaPurpose.EVIDENCE) {
      return `restricted/evidence/${ownerId}/${assetId}/original`;
    }
    return `public/${purpose.toLowerCase()}/${ownerId}/${assetId}/original`;
  }

  private buildVariantKey(
    purpose: EMediaPurpose,
    ownerId: string,
    assetId: string,
    size: string,
    format: string,
  ): string {
    const ext = format.toLowerCase() === 'jpeg' ? 'jpg' : format.toLowerCase();
    if (purpose === EMediaPurpose.EVIDENCE) {
      return `restricted/evidence/${ownerId}/${assetId}/variants/${size.toLowerCase()}.${ext}`;
    }
    return `public/${purpose.toLowerCase()}/${ownerId}/${assetId}/variants/${size.toLowerCase()}.${ext}`;
  }

  private assertDimensions(width: number, height: number): void {
    const longest = Math.max(width, height);
    if (longest < MEDIA_MIN_DIMENSION || longest > MEDIA_MAX_DIMENSION) {
      throw new Error('image dimensions out of range');
    }
  }

  private async publishProcessed(asset: IMediaAsset): Promise<void> {
    await this.eventPublisher.publish(
      createEventEnvelope({
        eventId: randomUUID(),
        eventType: 'media.asset.processed',
        aggregateId: asset.id,
        producerModule: 'media',
        correlationId: randomUUID(),
        payload: {
          assetId: asset.id,
          purpose: asset.purpose,
          ownerId: asset.ownerId,
          status: asset.status,
        },
      }),
    );
    Logger.info('Media asset processed', {
      eventName: 'media_asset_processed',
      eventData: {
        assetId: asset.id,
        purpose: asset.purpose,
        status: asset.status,
      },
    });
  }

  private fieldInvalid(field: string, message: string): IThrowedError {
    return {
      status: 400,
      errorCode: EErrorCode.FIELD_INVALID,
      message,
      details: { field },
    } as IThrowedError;
  }

  private notFound(id: string): IThrowedError {
    return {
      status: 404,
      errorCode: EErrorCode.RESOURCE_NOT_FOUND,
      message: 'Media asset not found',
      details: { id },
    } as IThrowedError;
  }
}
