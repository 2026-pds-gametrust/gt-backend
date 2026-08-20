import { requireNonEmptyString } from '../../common/types/required-string';
import { EMediaAssetStatus } from './enums/EMediaAssetStatus';
import { EMediaBucketClass } from './enums/EMediaBucketClass';
import { EMediaPurpose } from './enums/EMediaPurpose';
import { IMediaAsset, IMediaVariant } from './interfaces/media-asset.interface';

const ALLOWED_IMAGE_CONTENT_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const ALLOWED_VIDEO_CONTENT_TYPES = new Set(['video/mp4']);

const ALLOWED_CONTENT_TYPES = new Set([
  ...ALLOWED_IMAGE_CONTENT_TYPES,
  ...ALLOWED_VIDEO_CONTENT_TYPES,
]);

export const MEDIA_MAX_BYTES = 10 * 1024 * 1024;
export const MEDIA_MAX_VIDEO_BYTES = 50 * 1024 * 1024;
export const MEDIA_MIN_DIMENSION = 200;
export const MEDIA_MAX_DIMENSION = 8000;

export class MediaAssetServiceEntity implements IMediaAsset {
  id: string;
  purpose: EMediaPurpose;
  ownerId: string;
  status: EMediaAssetStatus;
  contentType: string;
  byteSize: number;
  originalKey: string;
  bucketClass: EMediaBucketClass;
  variants: IMediaVariant[];
  failureReason?: string;
  createdAt: Date;
  updatedAt?: Date;

  constructor(asset: IMediaAsset) {
    this.validate(asset);
    this.id = asset.id;
    this.purpose = asset.purpose;
    this.ownerId = asset.ownerId.trim();
    this.status = asset.status;
    this.contentType = asset.contentType.trim().toLowerCase();
    this.byteSize = asset.byteSize;
    this.originalKey = asset.originalKey.trim();
    this.bucketClass = asset.bucketClass;
    this.variants = asset.variants ?? [];
    this.failureReason = asset.failureReason?.trim();
    this.createdAt = asset.createdAt || new Date();
    this.updatedAt = asset.updatedAt;
  }

  private validate(asset: IMediaAsset): void {
    requireNonEmptyString(asset.id, 'id');
    requireNonEmptyString(asset.ownerId, 'ownerId');
    requireNonEmptyString(asset.originalKey, 'originalKey');
    requireNonEmptyString(asset.contentType, 'contentType');
    if (!asset.purpose) {
      throw new Error('purpose is required');
    }
    if (!asset.status) {
      throw new Error('status is required');
    }
    if (!asset.bucketClass) {
      throw new Error('bucketClass is required');
    }
    const contentType = asset.contentType.trim().toLowerCase();
    if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
      throw new Error('contentType is invalid');
    }
    if (!Number.isInteger(asset.byteSize) || asset.byteSize < 1) {
      throw new Error('byteSize must be a positive integer');
    }
    const maxBytes = maxBytesForContentType(contentType);
    if (asset.byteSize > maxBytes) {
      throw new Error('byteSize exceeds maximum');
    }
  }
}

export function isAllowedMediaContentType(contentType: string): boolean {
  return ALLOWED_CONTENT_TYPES.has(contentType.trim().toLowerCase());
}

export function isVideoContentType(contentType: string): boolean {
  return ALLOWED_VIDEO_CONTENT_TYPES.has(contentType.trim().toLowerCase());
}

export function isImageContentType(contentType: string): boolean {
  return ALLOWED_IMAGE_CONTENT_TYPES.has(contentType.trim().toLowerCase());
}

export function maxBytesForContentType(contentType: string): number {
  return isVideoContentType(contentType)
    ? MEDIA_MAX_VIDEO_BYTES
    : MEDIA_MAX_BYTES;
}

/** ISO BMFF / MP4: bytes 4..8 are ASCII "ftyp". */
export function isMp4Buffer(buffer: Buffer): boolean {
  if (buffer.length < 8) {
    return false;
  }
  return buffer.subarray(4, 8).toString('ascii') === 'ftyp';
}
