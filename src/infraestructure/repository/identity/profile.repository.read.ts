import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { IProfile } from '../../../domain/identity/entity/interfaces/profile.interface';
import { IProfileRepositoryRead } from '../../../domain/identity/repository/profile.repository.read';
import { ProfileModel } from '../../db/mongo/models/profile.model';
import { dbToInternal } from './adapters/profile.adapter';

export class ProfileRepositoryRead implements IProfileRepositoryRead {
  async findProfileById(id: string): Promise<IProfile | null> {
    try {
      const doc = await ProfileModel.findOne({ id });
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'ProfileRepositoryRead.findProfileById',
        eventData: { id },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async findProfileByUserId(userId: string): Promise<IProfile | null> {
    try {
      const doc = await ProfileModel.findOne({ userId });
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'ProfileRepositoryRead.findProfileByUserId',
        eventData: { userId },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async listProfiles(filter: Partial<IProfile> = {}): Promise<IProfile[]> {
    try {
      const docs = await ProfileModel.find(filter);
      return docs.map(dbToInternal);
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'ProfileRepositoryRead.listProfiles',
        eventData: { filter },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
