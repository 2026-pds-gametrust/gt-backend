import { IEventPublisher } from '../../common/messaging/event-publisher.interface';
import { IActorContext } from '../../common/types/actor-context';
import { EUserStatus } from '../entity/enums/EUserStatus';
import { IUser } from '../entity/interfaces/user.interface';
import { IUserSummary } from '../entity/interfaces/user-summary.interface';
import { IUserRepositoryRead } from '../repository/user.repository.read';
import { IUserRepositoryWrite } from '../repository/user.repository.write';

export interface IParamsCreateUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  cpf: string;
  birthDate: string;
  verified?: boolean;
  phoneVerified?: boolean;
  status?: EUserStatus;
}

export interface IParamsUpdateUser {
  userData: Partial<
    Pick<
      IUser,
      | 'fullName'
      | 'email'
      | 'phone'
      | 'cpf'
      | 'birthDate'
      | 'verified'
      | 'phoneVerified'
      | 'status'
    >
  >;
}

export interface IParamsUserService {
  userRepositoryRead: IUserRepositoryRead;
  userRepositoryWrite: IUserRepositoryWrite;
  eventPublisher: IEventPublisher;
}

export interface IUserService {
  createUser(params: IParamsCreateUser): Promise<IUser>;
  getUserById(id: string, actor: IActorContext): Promise<IUser>;
  getUserByEmail(email: string): Promise<IUser>;
  updateUserById(
    id: string,
    params: IParamsUpdateUser,
    actor: IActorContext,
  ): Promise<IUser>;
  deleteUserById(id: string, actor: IActorContext): Promise<IUser>;
  listUsers(filter?: Partial<IUser>): Promise<IUser[]>;
  getUserSummary(userId: string): Promise<IUserSummary | null>;
  verifyUser(userId: string): Promise<IUser>;
  verifyPhone(userId: string): Promise<IUser>;
}
