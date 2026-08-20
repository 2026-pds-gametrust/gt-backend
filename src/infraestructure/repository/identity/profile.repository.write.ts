import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { IProfile } from '../../../domain/identity/entity/interfaces/profile.interface';
import { IProfileRepositoryWrite } from '../../../domain/identity/repository/profile.repository.write';
import { ProfileModel } from '../../db/mongo/models/profile.model';
import { dbToInternal, internalToDb } from './adapters/profile.adapter';

export class ProfileRepositoryWrite implements IProfileRepositoryWrite {
  async createProfile(profileData: IProfile): Promise<IProfile> {
    try {
      const profile = await ProfileModel.create(internalToDb(profileData));
      return dbToInternal(profile);
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'ProfileRepositoryWrite.createProfile',
        eventData: { id: profileData.id },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async updateProfileById(
    id: string,
    updateData: Partial<IProfile>,
  ): Promise<IProfile | null> {
    try {
      const profile = await ProfileModel.findOneAndUpdate(
        { id },
        { $set: updateData },
        { new: true },
      );
      return profile ? dbToInternal(profile) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'ProfileRepositoryWrite.updateProfileById',
        eventData: { id },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async deleteProfileById(id: string): Promise<IProfile | null> {
    try {
      const profile = await ProfileModel.findOneAndDelete({ id });
      return profile ? dbToInternal(profile) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'ProfileRepositoryWrite.deleteProfileById',
        eventData: { id },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
