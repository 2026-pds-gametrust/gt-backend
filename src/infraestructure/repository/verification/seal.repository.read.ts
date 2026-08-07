import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { ESealStatus } from '../../../domain/verification/entity/enums/ESealStatus';
import { ISeal } from '../../../domain/verification/entity/interfaces/seal.interface';
import { ISealRepositoryRead } from '../../../domain/verification/repository/seal.repository.read';
import { SealModel } from '../../db/mongo/models/seal.model';
import { dbToInternal } from './adapters/seal.adapter';

export class SealRepositoryRead implements ISealRepositoryRead {
  async findSealById(id: string): Promise<ISeal | null> {
    try {
      const doc = await SealModel.findOne({ id });
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'SealRepositoryRead.findSealById',
        eventData: { id },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async findActiveSealByListingId(listingId: string): Promise<ISeal | null> {
    try {
      const doc = await SealModel.findOne({
        listingId,
        status: ESealStatus.GRANTED,
      });
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'SealRepositoryRead.findActiveSealByListingId',
        eventData: { listingId },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async listSealsByListingId(listingId: string): Promise<ISeal[]> {
    try {
      const docs = await SealModel.find({ listingId });
      return docs.map(dbToInternal);
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'SealRepositoryRead.listSealsByListingId',
        eventData: { listingId },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
