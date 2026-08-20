import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { IMediaAsset } from '../../../domain/media/entity/interfaces/media-asset.interface';
import { IMediaAssetRepositoryRead } from '../../../domain/media/repository/media-asset.repository.read';
import { MediaAssetModel } from '../../db/mongo/models/media-asset.model';
import { dbToInternal } from './adapters/media-asset.adapter';

export class MediaAssetRepositoryRead implements IMediaAssetRepositoryRead {
  async findMediaAssetById(id: string): Promise<IMediaAsset | null> {
    try {
      const doc = await MediaAssetModel.findOne({ id });
      return doc ? dbToInternal(doc) : null;
    } catch (error) {
      serviceLogErrorHandler(error as Error, {
        eventName: 'MediaAssetRepositoryRead.findMediaAssetById',
        eventData: { id },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
