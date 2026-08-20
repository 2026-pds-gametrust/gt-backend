import { IActorContext } from '../../common/types/actor-context';
import { IUser } from '../entity/interfaces/user.interface';
import { IPasswordHasher } from '../ports/password-hasher.interface';
import { IRefreshTokenHasher } from '../ports/refresh-token-hasher.interface';
import { ITokenSigner } from '../ports/token-signer.interface';
import { ICredentialRepositoryRead } from '../repository/credential.repository.read';
import { ICredentialRepositoryWrite } from '../repository/credential.repository.write';
import { IRefreshSessionRepositoryRead } from '../repository/refresh-session.repository.read';
import { IRefreshSessionRepositoryWrite } from '../repository/refresh-session.repository.write';
import { IUserRepositoryRead } from '../repository/user.repository.read';
import { IUserRepositoryWrite } from '../repository/user.repository.write';
import { IUserService } from './user.service.interface';
import { IProfileService } from './profile.service.interface';

export interface IAuthSession {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}

export interface IParamsRegister {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  cpf: string;
  birthDate: string;
  password: string;
}

export interface IParamsLogin {
  email: string;
  password: string;
}

export interface IParamsRefresh {
  refreshToken: string;
}

export interface IParamsAuthService {
  userService: IUserService;
  profileService: IProfileService;
  userRepositoryRead: IUserRepositoryRead;
  userRepositoryWrite: IUserRepositoryWrite;
  credentialRepositoryRead: ICredentialRepositoryRead;
  credentialRepositoryWrite: ICredentialRepositoryWrite;
  refreshSessionRepositoryRead: IRefreshSessionRepositoryRead;
  refreshSessionRepositoryWrite: IRefreshSessionRepositoryWrite;
  passwordHasher: IPasswordHasher;
  tokenSigner: ITokenSigner;
  refreshTokenHasher: IRefreshTokenHasher;
  refreshTtlSeconds: number;
}

export interface IAuthService {
  register(params: IParamsRegister): Promise<IAuthSession>;
  login(params: IParamsLogin): Promise<IAuthSession>;
  refresh(params: IParamsRefresh): Promise<IAuthSession>;
  logout(actor: IActorContext): Promise<void>;
  me(actor: IActorContext): Promise<IUser>;
  assignGroups(
    actor: IActorContext,
    targetUserId: string,
    groups: string[],
  ): Promise<IUser>;
}
