import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { IProfile } from '../../../domain/identity/entity/interfaces/profile.interface';
import {
  IProfileNearHit,
  IProfileNearQuery,
  IProfileRepositoryRead,
} from '../../../domain/identity/repository/profile.repository.read';
import { ProfileModel } from '../../db/mongo/models/profile.model';
import { dbToInternal } from './adapters/profile.adapter';

type GeoNearDoc = IProfile & {
  _id?: unknown;
  distanceMeters?: number;
};

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

  async findProfilesByUserIds(userIds: string[]): Promise<IProfile[]> {
    if (userIds.length === 0) {
      return [];
    }
    try {
      const docs = await ProfileModel.find({ userId: { $in: userIds } });
      return docs.map(dbToInternal);
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'ProfileRepositoryRead.findProfilesByUserIds',
        eventData: { userIdsCount: userIds.length },
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

  async findNear(query: IProfileNearQuery): Promise<IProfileNearHit[]> {
    try {
      const docs = await ProfileModel.aggregate<GeoNearDoc>([
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [query.lng, query.lat],
            },
            key: 'addresses.geo',
            distanceField: 'distanceMeters',
            maxDistance: query.maxDistanceMeters,
            spherical: true,
          },
        },
        { $limit: query.limit },
      ]);
      return docs.map((doc) => ({
        profile: dbToInternal(doc as never),
        distanceMeters: Number(doc.distanceMeters ?? 0),
      }));
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'ProfileRepositoryRead.findNear',
        eventData: {
          maxDistanceMeters: query.maxDistanceMeters,
          limit: query.limit,
        },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
