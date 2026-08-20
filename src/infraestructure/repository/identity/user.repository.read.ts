import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { escapeRegexLiteral } from '../../../domain/common/types/regex-literal';
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

  async findUserIdsBySearchQuery(
    query: string,
    limit: number,
  ): Promise<string[]> {
    const trimmed = query.trim();
    if (!trimmed) {
      return [];
    }
    try {
      const escaped = escapeRegexLiteral(trimmed);
      const docs = await UserModel.find({
        $or: [
          { fullName: { $regex: escaped, $options: 'i' } },
          { email: { $regex: escaped, $options: 'i' } },
          { id: { $regex: escaped, $options: 'i' } },
        ],
      })
        .limit(limit)
        .select('id');
      return docs.map((doc) => doc.id);
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'UserRepositoryRead.findUserIdsBySearchQuery',
        eventData: { queryLength: trimmed.length, limit },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async findUsersByIds(ids: string[]): Promise<IUser[]> {
    if (ids.length === 0) {
      return [];
    }
    try {
      const docs = await UserModel.find({ id: { $in: ids } });
      return docs.map(dbToInternal);
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'UserRepositoryRead.findUsersByIds',
        eventData: { idsCount: ids.length },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
