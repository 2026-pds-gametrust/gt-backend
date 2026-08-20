import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { IMediaAsset } from '../../../domain/media/entity/interfaces/media-asset.interface';
import { IMediaAssetRepositoryWrite } from '../../../domain/media/repository/media-asset.repository.write';
import { MediaAssetModel } from '../../db/mongo/models/media-asset.model';
import { dbToInternal, internalToDb } from './adapters/media-asset.adapter';

export class MediaAssetRepositoryWrite implements IMediaAssetRepositoryWrite {
  async createMediaAsset(asset: IMediaAsset): Promise<IMediaAsset> {
    try {
      const doc = await MediaAssetModel.create(internalToDb(asset));
      return dbToInternal(doc);
    } catch (error) {
      serviceLogErrorHandler(error as Error, {
        eventName: 'MediaAssetRepositoryWrite.createMediaAsset',
        eventData: { id: asset.id, purpose: asset.purpose },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async updateMediaAssetById(
    id: string,
    data: Partial<IMediaAsset>,
  ): Promise<IMediaAsset | null> {
    try {
      const doc = await MediaAssetModel.findOneAndUpdate(
        { id },
        { $set: data },
        { new: true },
      );
      return doc ? dbToInternal(doc) : null;
    } catch (error) {
      serviceLogErrorHandler(error as Error, {
        eventName: 'MediaAssetRepositoryWrite.updateMediaAssetById',
        eventData: { id },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
