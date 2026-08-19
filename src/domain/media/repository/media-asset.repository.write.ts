import { IMediaAsset } from '../entity/interfaces/media-asset.interface';

export interface IMediaAssetRepositoryWrite {
  createMediaAsset(asset: IMediaAsset): Promise<IMediaAsset>;
  updateMediaAssetById(
    id: string,
    data: Partial<IMediaAsset>,
  ): Promise<IMediaAsset | null>;
}
