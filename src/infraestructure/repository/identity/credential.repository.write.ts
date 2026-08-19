import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { ICredential } from '../../../domain/identity/entity/interfaces/credential.interface';
import { ICredentialRepositoryWrite } from '../../../domain/identity/repository/credential.repository.write';
import { CredentialModel } from '../../db/mongo/models/credential.model';
import { dbToInternal, internalToDb } from './adapters/credential.adapter';

export class CredentialRepositoryWrite implements ICredentialRepositoryWrite {
  async createCredential(credential: ICredential): Promise<ICredential> {
    try {
      const created = await CredentialModel.create(internalToDb(credential));
      return dbToInternal(created);
    } catch (error: unknown) {
      serviceLogErrorHandler(error as Error, {
        eventName: 'CredentialRepositoryWrite.createCredential',
        eventData: { userId: credential.userId },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async deleteByUserId(userId: string): Promise<ICredential | null> {
    try {
      const deleted = await CredentialModel.findOneAndDelete({ userId });
      return deleted ? dbToInternal(deleted) : null;
    } catch (error: unknown) {
      serviceLogErrorHandler(error as Error, {
        eventName: 'CredentialRepositoryWrite.deleteByUserId',
        eventData: { userId },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
