import { IMediaAsset } from '../entity/interfaces/media-asset.interface';

export interface IMediaAssetRepositoryRead {
  findMediaAssetById(id: string): Promise<IMediaAsset | null>;
}
