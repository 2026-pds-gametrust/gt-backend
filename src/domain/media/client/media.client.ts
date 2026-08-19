import { EMediaPurpose } from '../entity/enums/EMediaPurpose';
import { IMediaAsset } from '../entity/interfaces/media-asset.interface';

export interface IParamsAssertAttachableAsset {
  assetId: string;
  purpose: EMediaPurpose;
  ownerId: string;
}

export interface IMediaClient {
  getReadyAsset(assetId: string): Promise<IMediaAsset | null>;
  resolvePublicVariantUrls(assetId: string): Promise<string[]>;
  resolvePublicVideoUrl(assetId: string): Promise<string | null>;
  assertAttachableAsset(
    params: IParamsAssertAttachableAsset,
  ): Promise<IMediaAsset>;
}
