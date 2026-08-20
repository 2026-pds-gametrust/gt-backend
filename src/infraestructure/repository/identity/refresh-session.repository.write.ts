import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { IRefreshSession } from '../../../domain/identity/entity/interfaces/refresh-session.interface';
import { IRefreshSessionRepositoryWrite } from '../../../domain/identity/repository/refresh-session.repository.write';
import { RefreshSessionModel } from '../../db/mongo/models/refresh-session.model';
import { dbToInternal, internalToDb } from './adapters/refresh-session.adapter';

export class RefreshSessionRepositoryWrite
  implements IRefreshSessionRepositoryWrite
{
  async createRefreshSession(
    session: IRefreshSession,
  ): Promise<IRefreshSession> {
    try {
      const created = await RefreshSessionModel.create(internalToDb(session));
      return dbToInternal(created);
    } catch (error: unknown) {
      serviceLogErrorHandler(error as Error, {
        eventName: 'RefreshSessionRepositoryWrite.createRefreshSession',
        eventData: { userId: session.userId },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async revokeIfUnrevoked(id: string): Promise<IRefreshSession | null> {
    try {
      const updated = await RefreshSessionModel.findOneAndUpdate(
        { id, revokedAt: { $exists: false } },
        { $set: { revokedAt: new Date() } },
        { new: true },
      );
      return updated ? dbToInternal(updated) : null;
    } catch (error: unknown) {
      serviceLogErrorHandler(error as Error, {
        eventName: 'RefreshSessionRepositoryWrite.revokeIfUnrevoked',
        eventData: { id },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async revokeById(id: string): Promise<IRefreshSession | null> {
    try {
      const updated = await RefreshSessionModel.findOneAndUpdate(
        { id },
        { $set: { revokedAt: new Date() } },
        { new: true },
      );
      return updated ? dbToInternal(updated) : null;
    } catch (error: unknown) {
      serviceLogErrorHandler(error as Error, {
        eventName: 'RefreshSessionRepositoryWrite.revokeById',
        eventData: { id },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async invalidateAccessAndRevokeById(
    id: string,
  ): Promise<IRefreshSession | null> {
    try {
      const now = new Date();
      const updated = await RefreshSessionModel.findOneAndUpdate(
        { id },
        { $set: { revokedAt: now, accessInvalidatedAt: now } },
        { new: true },
      );
      return updated ? dbToInternal(updated) : null;
    } catch (error: unknown) {
      serviceLogErrorHandler(error as Error, {
        eventName: 'RefreshSessionRepositoryWrite.invalidateAccessAndRevokeById',
        eventData: { id },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async revokeFamilyById(familyId: string): Promise<void> {
    try {
      await RefreshSessionModel.updateMany(
        { familyId },
        { $set: { revokedAt: new Date() } },
      );
    } catch (error: unknown) {
      serviceLogErrorHandler(error as Error, {
        eventName: 'RefreshSessionRepositoryWrite.revokeFamilyById',
        eventData: { familyId },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
