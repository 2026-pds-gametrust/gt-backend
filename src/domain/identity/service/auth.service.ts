import { EUserGroup, IThrowedError } from '@sauvvitech/st-packages';
import { randomUUID } from 'crypto';
import { Logger } from 'traceability';
import { EErrorCode } from '../../common/errors/enums/EErrorCode';
import { IActorContext } from '../../common/types/actor-context';
import { EUserStatus } from '../entity/enums/EUserStatus';
import { CredentialServiceEntity } from '../entity/credential.entity';
import { RefreshSessionServiceEntity } from '../entity/refresh-session.entity';
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
import {
  IAuthService,
  IAuthSession,
  IParamsAuthService,
  IParamsLogin,
  IParamsRefresh,
  IParamsRegister,
} from './auth.service.interface';
import { IProfileService } from './profile.service.interface';
import { IUserService } from './user.service.interface';

const SYSTEM_GROUP = 'SYSTEM';
const DUMMY_PASSWORD_HASH =
  '$2b$12$PR9Tl6mEsRSdGtdGrw2jAeRhC3M26i14O2woW/S6WX42u07Updx5G';

const HTTP_ASSIGNABLE_GROUPS = new Set<string>([
  EUserGroup.APP_USER,
  EUserGroup.PARTNER,
  EUserGroup.ADMIN,
  EUserGroup.BACKOFFICE,
]);

export class AuthService implements IAuthService {
  private readonly userService: IUserService;
  private readonly profileService: IProfileService;
  private readonly userRepositoryRead: IUserRepositoryRead;
  private readonly userRepositoryWrite: IUserRepositoryWrite;
  private readonly credentialRepositoryRead: ICredentialRepositoryRead;
  private readonly credentialRepositoryWrite: ICredentialRepositoryWrite;
  private readonly refreshSessionRepositoryRead: IRefreshSessionRepositoryRead;
  private readonly refreshSessionRepositoryWrite: IRefreshSessionRepositoryWrite;
  private readonly passwordHasher: IPasswordHasher;
  private readonly tokenSigner: ITokenSigner;
  private readonly refreshTokenHasher: IRefreshTokenHasher;
  private readonly refreshTtlSeconds: number;

  constructor(params: IParamsAuthService) {
    this.userService = params.userService;
    this.profileService = params.profileService;
    this.userRepositoryRead = params.userRepositoryRead;
    this.userRepositoryWrite = params.userRepositoryWrite;
    this.credentialRepositoryRead = params.credentialRepositoryRead;
    this.credentialRepositoryWrite = params.credentialRepositoryWrite;
    this.refreshSessionRepositoryRead = params.refreshSessionRepositoryRead;
    this.refreshSessionRepositoryWrite = params.refreshSessionRepositoryWrite;
    this.passwordHasher = params.passwordHasher;
    this.tokenSigner = params.tokenSigner;
    this.refreshTokenHasher = params.refreshTokenHasher;
    this.refreshTtlSeconds = params.refreshTtlSeconds;
  }

  async register(params: IParamsRegister): Promise<IAuthSession> {
    if (!params.password?.trim()) {
      throw {
        status: 400,
        errorCode: EErrorCode.FIELD_INVALID,
        message: 'Password is required',
        details: { field: 'password' },
      } as IThrowedError;
    }

    const passwordHash = await this.passwordHasher.hash(params.password);

    let created: IUser;
    try {
      created = await this.userService.createUser({
        id: params.id,
        fullName: params.fullName,
        email: params.email,
        phone: params.phone,
        cpf: params.cpf,
        birthDate: params.birthDate,
      });
    } catch (error) {
      throw await this.mapRegisterPersistenceError(error, params);
    }

    try {
      const credential = new CredentialServiceEntity({
        id: randomUUID(),
        userId: created.id,
        passwordHash,
        createdAt: new Date(),
      });
      await this.credentialRepositoryWrite.createCredential(credential);
    } catch (error) {
      await this.userRepositoryWrite.deleteUserById(created.id);
      throw error;
    }

    try {
      await this.profileService.createProfile(
        {
          id: randomUUID(),
          userId: created.id,
          displayName: created.fullName,
          addresses: [],
          allowEmptyAddresses: true,
        },
        { actorId: created.id, groups: [EUserGroup.APP_USER] },
      );
    } catch (error) {
      await this.credentialRepositoryWrite.deleteByUserId(created.id);
      await this.userRepositoryWrite.deleteUserById(created.id);
      throw error;
    }

    const withGroups = await this.userRepositoryWrite.updateUserById(
      created.id,
      { groups: [EUserGroup.APP_USER] },
    );
    const user = withGroups ?? { ...created, groups: [EUserGroup.APP_USER] };

    const session = await this.issueSession(user);
    Logger.info(`auth.register.success userId=${user.id}`);
    return session;
  }

  async login(params: IParamsLogin): Promise<IAuthSession> {
    const email = params.email?.trim().toLowerCase() ?? '';
    const user = await this.userRepositoryRead.findUserByEmail(email);
    const credential = user
      ? await this.credentialRepositoryRead.findByUserId(user.id)
      : null;
    const passwordHash = credential?.passwordHash ?? DUMMY_PASSWORD_HASH;
    const passwordMatches = await this.passwordHasher.verify(
      params.password ?? '',
      passwordHash,
    );

    if (
      !user ||
      !credential ||
      !passwordMatches ||
      user.status === EUserStatus.BLOCKED
    ) {
      Logger.info('auth.login.failure');
      throw this.invalidCredentials();
    }

    const session = await this.issueSession(user);
    Logger.info(`auth.login.success userId=${user.id}`);
    return session;
  }

  async refresh(params: IParamsRefresh): Promise<IAuthSession> {
    const presented = params.refreshToken?.trim() ?? '';
    if (!presented) {
      throw this.invalidCredentials();
    }

    const tokenHash = this.refreshTokenHasher.hash(presented);
    const session =
      await this.refreshSessionRepositoryRead.findByTokenHash(tokenHash);
    if (!session) {
      throw this.invalidCredentials();
    }

    const user = await this.userRepositoryRead.findUserById(session.userId);
    if (!user || user.status === EUserStatus.BLOCKED) {
      throw this.invalidCredentials();
    }

    const now = new Date();
    if (session.revokedAt) {
      await this.refreshSessionRepositoryWrite.revokeFamilyById(
        session.familyId,
      );
      Logger.info(`auth.refresh.reuse userId=${user.id}`);
      throw this.invalidCredentials();
    }

    if (session.expiresAt.getTime() <= now.getTime()) {
      throw this.invalidCredentials();
    }

    const rotated =
      await this.refreshSessionRepositoryWrite.revokeIfUnrevoked(session.id);
    if (!rotated) {
      await this.refreshSessionRepositoryWrite.revokeFamilyById(
        session.familyId,
      );
      Logger.info(`auth.refresh.reuse userId=${user.id}`);
      throw this.invalidCredentials();
    }

    const issued = await this.issueSession(user, session.familyId);
    Logger.info(`auth.refresh.success userId=${user.id}`);
    return issued;
  }

  async logout(actor: IActorContext): Promise<void> {
    const sessionId = actor.sessionId?.trim();
    if (!sessionId) {
      Logger.info('auth.logout');
      return;
    }
    await this.refreshSessionRepositoryWrite.invalidateAccessAndRevokeById(
      sessionId,
    );
    Logger.info(`auth.logout userId=${actor.actorId}`);
  }

  async me(actor: IActorContext): Promise<IUser> {
    const user = await this.userRepositoryRead.findUserById(actor.actorId);
    if (!user) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'User not found',
        details: { id: actor.actorId },
      } as IThrowedError;
    }
    return this.toPublicUser(user);
  }

  async assignGroups(
    actor: IActorContext,
    targetUserId: string,
    groups: string[],
  ): Promise<IUser> {
    const nextGroups = Array.isArray(groups) ? groups : [];
    if (nextGroups.some((group) => group === SYSTEM_GROUP)) {
      throw {
        status: 400,
        errorCode: EErrorCode.FIELD_INVALID,
        message: 'SYSTEM cannot be assigned via HTTP',
        details: { field: 'groups' },
      } as IThrowedError;
    }

    const invalid = nextGroups.filter(
      (group) => !HTTP_ASSIGNABLE_GROUPS.has(group),
    );
    if (invalid.length > 0) {
      throw {
        status: 400,
        errorCode: EErrorCode.FIELD_INVALID,
        message: 'One or more groups are not assignable',
        details: { field: 'groups' },
      } as IThrowedError;
    }

    const isSelf = actor.actorId === targetUserId;
    const escalates = nextGroups.some(
      (group) =>
        group === EUserGroup.ADMIN || group === EUserGroup.BACKOFFICE,
    );
    if (isSelf && escalates) {
      throw {
        status: 403,
        errorCode: EErrorCode.FIELD_INVALID,
        message: 'Cannot assign ADMIN or BACKOFFICE to self',
        details: { field: 'groups' },
      } as IThrowedError;
    }

    const existing = await this.userRepositoryRead.findUserById(targetUserId);
    if (!existing) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'User not found',
        details: { id: targetUserId },
      } as IThrowedError;
    }

    const updated = await this.userRepositoryWrite.updateUserById(
      targetUserId,
      { groups: nextGroups },
    );
    if (!updated) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'User not found',
        details: { id: targetUserId },
      } as IThrowedError;
    }
    return this.toPublicUser(updated);
  }

  private async issueSession(
    user: IUser,
    familyId: string = randomUUID(),
  ): Promise<IAuthSession> {
    const generated = this.refreshTokenHasher.generate();
    const sessionId = randomUUID();
    const expiresAt = new Date(Date.now() + this.refreshTtlSeconds * 1000);
    const session = new RefreshSessionServiceEntity({
      id: sessionId,
      familyId,
      userId: user.id,
      tokenHash: generated.tokenHash,
      expiresAt,
      createdAt: new Date(),
    });
    await this.refreshSessionRepositoryWrite.createRefreshSession(session);

    const groups = (user.groups ?? []).filter(
      (group) => group !== SYSTEM_GROUP,
    );
    const accessToken = this.tokenSigner.signAccessToken({
      sub: user.id,
      groups,
      sid: sessionId,
      fid: familyId,
      typ: 'access',
    });

    return {
      user: this.toPublicUser({ ...user, groups }),
      accessToken,
      refreshToken: generated.plaintext,
    };
  }

  private toPublicUser(user: IUser): IUser {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      cpf: user.cpf,
      birthDate: user.birthDate,
      verified: user.verified,
      phoneVerified: user.phoneVerified,
      status: user.status,
      groups: user.groups ?? [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private invalidCredentials(): IThrowedError {
    return {
      status: 401,
      errorCode: EErrorCode.AUTH_INVALID_CREDENTIALS,
      message: 'Invalid credentials',
    } as IThrowedError;
  }

  private uniformRegisterFieldInvalid(): IThrowedError {
    return {
      status: 400,
      errorCode: EErrorCode.FIELD_INVALID,
      message: 'Invalid request',
    } as IThrowedError;
  }

  private async mapRegisterPersistenceError(
    error: unknown,
    params: IParamsRegister,
  ): Promise<never> {
    const thrown = error as IThrowedError;
    if (thrown?.errorCode === EErrorCode.RESOURCE_CONFLICT) {
      Logger.info('auth.register.rejected');
      throw this.uniformRegisterFieldInvalid();
    }
    if (thrown?.errorCode === EErrorCode.DATABASE_ERROR) {
      const email = params.email?.trim().toLowerCase() ?? '';
      const cpfDigits = params.cpf?.replace(/\D/g, '') ?? '';
      const existingByEmail = email
        ? await this.userRepositoryRead.findUserByEmail(email)
        : null;
      const existingByCpf = cpfDigits
        ? await this.userRepositoryRead.findUserByCpf(cpfDigits)
        : null;
      if (existingByEmail || existingByCpf) {
        Logger.info('auth.register.rejected');
        throw this.uniformRegisterFieldInvalid();
      }
    }
    throw error;
  }
}
