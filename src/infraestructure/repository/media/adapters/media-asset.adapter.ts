import { IMediaAsset } from '../../../../domain/media/entity/interfaces/media-asset.interface';
import { IMMediaAsset } from '../../../db/mongo/models/media-asset.model';

export function dbToInternal(doc: IMMediaAsset): IMediaAsset {
  return {
    id: doc.id,
    purpose: doc.purpose,
    ownerId: doc.ownerId,
    status: doc.status,
    contentType: doc.contentType,
    byteSize: doc.byteSize,
    originalKey: doc.originalKey,
    bucketClass: doc.bucketClass,
    variants: (doc.variants ?? []).map((variant) => ({
      size: variant.size,
      format: variant.format,
      storageKey: variant.storageKey,
      width: variant.width,
      height: variant.height,
      byteSize: variant.byteSize,
      publicUrl: variant.publicUrl,
    })),
    failureReason: doc.failureReason,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export function internalToDb(
  asset: IMediaAsset,
): Omit<IMMediaAsset, '_id' | 'createdAt' | 'updatedAt'> {
  return {
    id: asset.id,
    purpose: asset.purpose,
    ownerId: asset.ownerId,
    status: asset.status,
    contentType: asset.contentType,
    byteSize: asset.byteSize,
    originalKey: asset.originalKey,
    bucketClass: asset.bucketClass,
    variants: asset.variants,
    failureReason: asset.failureReason,
  };
}
