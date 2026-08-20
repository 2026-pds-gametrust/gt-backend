import { IEventPublisher } from '../../common/messaging/event-publisher.interface';
import { IActorContext } from '../../common/types/actor-context';
import { IMediaClient } from '../client/media.client';
import { EMediaPurpose } from '../entity/enums/EMediaPurpose';
import { IMediaAsset } from '../entity/interfaces/media-asset.interface';
import { IMediaOwnershipLookup } from '../ownership/media-ownership-lookup.interface';
import { IImageProcessor } from '../processing/image-processor.interface';
import { IMediaAssetRepositoryRead } from '../repository/media-asset.repository.read';
import { IMediaAssetRepositoryWrite } from '../repository/media-asset.repository.write';
import { IObjectStorage, IPresignedUrl } from '../storage/object-storage.interface';

export interface IParamsCreateMediaUpload {
  id?: string;
  purpose: EMediaPurpose;
  ownerId: string;
  contentType: string;
  byteSize: number;
}

export interface IMediaUploadGrant {
  asset: IMediaAsset;
  upload: IPresignedUrl;
}

export interface IMediaContentGrant {
  url: string;
  expiresAt: Date;
}

export interface IMediaAssetView {
  id: string;
  purpose: EMediaPurpose;
  ownerId: string;
  status: IMediaAsset['status'];
  contentType: string;
  byteSize: number;
  variants: Array<{
    size: string;
    format: string;
    width: number;
    height: number;
    byteSize: number;
    publicUrl?: string;
  }>;
  createdAt: Date;
  updatedAt?: Date;
}

export interface IParamsMediaAssetService {
  mediaAssetRepositoryRead: IMediaAssetRepositoryRead;
  mediaAssetRepositoryWrite: IMediaAssetRepositoryWrite;
  objectStorage: IObjectStorage;
  imageProcessor: IImageProcessor;
  eventPublisher: IEventPublisher;
  ownershipLookup: IMediaOwnershipLookup;
  publicBaseUrl: string;
  putUrlTtlSeconds: number;
  getUrlTtlSeconds: number;
}

export interface IMediaAssetService extends IMediaClient {
  createUpload(
    params: IParamsCreateMediaUpload,
    actor: IActorContext,
  ): Promise<IMediaUploadGrant>;
  completeUpload(id: string, actor: IActorContext): Promise<IMediaAsset>;
  processUploadedAsset(id: string): Promise<IMediaAsset>;
  getMediaAssetView(id: string, actor: IActorContext): Promise<IMediaAssetView>;
  getContentGrant(
    id: string,
    actor: IActorContext,
  ): Promise<IMediaContentGrant>;
}
