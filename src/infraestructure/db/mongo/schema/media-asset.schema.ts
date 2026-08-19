import { Schema } from 'mongoose';
import { EMediaAssetStatus } from '../../../../domain/media/entity/enums/EMediaAssetStatus';
import { EMediaBucketClass } from '../../../../domain/media/entity/enums/EMediaBucketClass';
import { EMediaPurpose } from '../../../../domain/media/entity/enums/EMediaPurpose';
import { EMediaVariantFormat } from '../../../../domain/media/entity/enums/EMediaVariantFormat';
import { EMediaVariantSize } from '../../../../domain/media/entity/enums/EMediaVariantSize';
import type { IMMediaAsset } from '../models/media-asset.model';

const VariantSchema = new Schema(
  {
    size: {
      type: String,
      enum: Object.values(EMediaVariantSize),
      required: true,
    },
    format: {
      type: String,
      enum: Object.values(EMediaVariantFormat),
      required: true,
    },
    storageKey: { type: String, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    byteSize: { type: Number, required: true },
    publicUrl: { type: String },
  },
  { _id: false },
);

export const MediaAssetSchema = new Schema<IMMediaAsset>(
  {
    id: { type: String, required: true, unique: true },
    purpose: {
      type: String,
      enum: Object.values(EMediaPurpose),
      required: true,
    },
    ownerId: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: Object.values(EMediaAssetStatus),
      required: true,
    },
    contentType: { type: String, required: true },
    byteSize: { type: Number, required: true },
    originalKey: { type: String, required: true },
    bucketClass: {
      type: String,
      enum: Object.values(EMediaBucketClass),
      required: true,
    },
    variants: { type: [VariantSchema], default: [] },
    failureReason: { type: String },
  },
  { timestamps: true, collection: 'media_assets' },
);

// find by owner + purpose + status when attaching
MediaAssetSchema.index({ ownerId: 1, purpose: 1, status: 1 });
