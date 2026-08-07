import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { IUser } from '../../../domain/identity/entity/interfaces/user.interface';
import { IUserRepositoryRead } from '../../../domain/identity/repository/user.repository.read';
import { UserModel } from '../../db/mongo/models/user.model';
import { dbToInternal } from './adapters/user.adapter';

export class UserRepositoryRead implements IUserRepositoryRead {
  async findUserById(id: string): Promise<IUser | null> {
    try {
      const doc = await UserModel.findOne({ id });
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'UserRepositoryRead.findUserById',
        eventData: { id },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async findUserByEmail(email: string): Promise<IUser | null> {
    try {
      const doc = await UserModel.findOne({ email });
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'UserRepositoryRead.findUserByEmail',
        eventData: { email },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async findUserByCpf(cpf: string): Promise<IUser | null> {
    try {
      const doc = await UserModel.findOne({ cpf });
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'UserRepositoryRead.findUserByCpf',
        eventData: {},
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async listUsers(filter: Partial<IUser> = {}): Promise<IUser[]> {
    try {
      const docs = await UserModel.find(filter);
      return docs.map(dbToInternal);
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'UserRepositoryRead.listUsers',
        eventData: { filter },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
