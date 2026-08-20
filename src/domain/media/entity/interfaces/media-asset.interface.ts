import { EMediaAssetStatus } from '../enums/EMediaAssetStatus';
import { EMediaBucketClass } from '../enums/EMediaBucketClass';
import { EMediaPurpose } from '../enums/EMediaPurpose';
import { EMediaVariantFormat } from '../enums/EMediaVariantFormat';
import { EMediaVariantSize } from '../enums/EMediaVariantSize';

export interface IMediaVariant {
  size: EMediaVariantSize;
  format: EMediaVariantFormat;
  storageKey: string;
  width: number;
  height: number;
  byteSize: number;
  publicUrl?: string;
}

export interface IMediaAsset {
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
}
