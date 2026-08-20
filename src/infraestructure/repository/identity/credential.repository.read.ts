import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { ICredential } from '../../../domain/identity/entity/interfaces/credential.interface';
import { ICredentialRepositoryRead } from '../../../domain/identity/repository/credential.repository.read';
import { CredentialModel } from '../../db/mongo/models/credential.model';
import { dbToInternal } from './adapters/credential.adapter';

export class CredentialRepositoryRead implements ICredentialRepositoryRead {
  async findByUserId(userId: string): Promise<ICredential | null> {
    try {
      const doc = await CredentialModel.findOne({ userId });
      return doc ? dbToInternal(doc) : null;
    } catch (error: unknown) {
      serviceLogErrorHandler(error as Error, {
        eventName: 'CredentialRepositoryRead.findByUserId',
        eventData: { userId },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async findCredentialById(id: string): Promise<ICredential | null> {
    try {
      const doc = await CredentialModel.findOne({ id });
      return doc ? dbToInternal(doc) : null;
    } catch (error: unknown) {
      serviceLogErrorHandler(error as Error, {
        eventName: 'CredentialRepositoryRead.findCredentialById',
        eventData: { id },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
