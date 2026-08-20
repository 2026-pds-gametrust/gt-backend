import { Types, model } from 'mongoose';
import { IMediaAsset } from '../../../../domain/media/entity/interfaces/media-asset.interface';
import { MediaAssetSchema } from '../schema/media-asset.schema';

export interface IMMediaAsset extends Omit<IMediaAsset, '_id'> {
  _id: Types.ObjectId;
  updatedAt: Date;
}

export const MediaAssetModel = model<IMMediaAsset>(
  'MediaAsset',
  MediaAssetSchema,
);
