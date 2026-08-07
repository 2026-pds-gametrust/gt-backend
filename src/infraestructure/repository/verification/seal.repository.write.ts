import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { ISeal } from '../../../domain/verification/entity/interfaces/seal.interface';
import { ISealRepositoryWrite } from '../../../domain/verification/repository/seal.repository.write';
import { SealModel } from '../../db/mongo/models/seal.model';
import { dbToInternal, internalToDb } from './adapters/seal.adapter';

export class SealRepositoryWrite implements ISealRepositoryWrite {
  async createSeal(seal: ISeal): Promise<ISeal> {
    try {
      const doc = await SealModel.create(internalToDb(seal));
      return dbToInternal(doc);
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'SealRepositoryWrite.createSeal',
        eventData: { id: seal.id },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async updateSealById(
    id: string,
    data: Partial<ISeal>,
  ): Promise<ISeal | null> {
    try {
      const doc = await SealModel.findOneAndUpdate(
        { id },
        { $set: data },
        { new: true },
      );
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'SealRepositoryWrite.updateSealById',
        eventData: { id, data },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
