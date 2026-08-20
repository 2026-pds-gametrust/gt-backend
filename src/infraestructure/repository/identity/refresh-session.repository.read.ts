import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { IRefreshSession } from '../../../domain/identity/entity/interfaces/refresh-session.interface';
import { IRefreshSessionRepositoryRead } from '../../../domain/identity/repository/refresh-session.repository.read';
import { RefreshSessionModel } from '../../db/mongo/models/refresh-session.model';
import { dbToInternal } from './adapters/refresh-session.adapter';

export class RefreshSessionRepositoryRead
  implements IRefreshSessionRepositoryRead
{
  async findByTokenHash(tokenHash: string): Promise<IRefreshSession | null> {
    try {
      const doc = await RefreshSessionModel.findOne({ tokenHash });
      return doc ? dbToInternal(doc) : null;
    } catch (error: unknown) {
      serviceLogErrorHandler(error as Error, {
        eventName: 'RefreshSessionRepositoryRead.findByTokenHash',
        eventData: {},
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async findRefreshSessionById(id: string): Promise<IRefreshSession | null> {
    try {
      const doc = await RefreshSessionModel.findOne({ id });
      return doc ? dbToInternal(doc) : null;
    } catch (error: unknown) {
      serviceLogErrorHandler(error as Error, {
        eventName: 'RefreshSessionRepositoryRead.findRefreshSessionById',
        eventData: { id },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
