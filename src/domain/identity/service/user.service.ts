import { IThrowedError } from '@sauvvitech/st-packages';
import { randomUUID } from 'crypto';
import {
  assertOwnerOrAdminOnly,
  isAdmin,
} from '../../common/auth/actor-authorization';
import { EErrorCode } from '../../common/errors/enums/EErrorCode';
import { createEventEnvelope } from '../../common/messaging/event-envelope';
import { IActorContext } from '../../common/types/actor-context';
import { EUserStatus } from '../entity/enums/EUserStatus';
import { UserServiceEntity } from '../entity/user.entity';
import { IUser } from '../entity/interfaces/user.interface';
import { IUserSummary } from '../entity/interfaces/user-summary.interface';
import {
  IParamsCreateUser,
  IParamsUpdateUser,
  IParamsUserService,
  IUserService,
} from './user.service.interface';
import { IUserRepositoryRead } from '../repository/user.repository.read';
import { IUserRepositoryWrite } from '../repository/user.repository.write';
import { IEventPublisher } from '../../common/messaging/event-publisher.interface';

export class UserService implements IUserService {
  private readonly userRepositoryRead: IUserRepositoryRead;
  private readonly userRepositoryWrite: IUserRepositoryWrite;
  private readonly eventPublisher: IEventPublisher;

  constructor({
    userRepositoryRead,
    userRepositoryWrite,
    eventPublisher,
  }: IParamsUserService) {
    this.userRepositoryRead = userRepositoryRead;
    this.userRepositoryWrite = userRepositoryWrite;
    this.eventPublisher = eventPublisher;
  }

  async createUser(params: IParamsCreateUser): Promise<IUser> {
    this.assertAdult(params.birthDate);

    const entity = this.buildUserEntity({
      id: params.id,
      fullName: params.fullName,
      email: params.email,
      phone: params.phone,
      cpf: params.cpf,
      birthDate: params.birthDate,
      verified: params.verified ?? false,
      phoneVerified: params.phoneVerified ?? false,
      status: params.status ?? EUserStatus.PENDING_VERIFICATION,
      createdAt: new Date(),
    });

    await this.assertUniqueEmail(entity.email);
    await this.assertUniqueCpf(entity.cpf);

    const created = await this.userRepositoryWrite.createUser(entity);

    await this.eventPublisher.publish(
      createEventEnvelope({
        eventId: randomUUID(),
        eventType: 'identity.user.registered',
        aggregateId: created.id,
        producerModule: 'identity',
        correlationId: randomUUID(),
        payload: { userId: created.id },
      }),
    );

    return created;
  }

  async getUserById(id: string, actor: IActorContext): Promise<IUser> {
    assertOwnerOrAdminOnly(actor, id);
    return this.loadUser(id);
  }

  async getUserByEmail(email: string): Promise<IUser> {
    const user = await this.userRepositoryRead.findUserByEmail(
      email.trim().toLowerCase(),
    );
    if (!user) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'User not found',
        details: { email },
      } as IThrowedError;
    }
    return user;
  }

  async updateUserById(
    id: string,
    params: IParamsUpdateUser,
    actor: IActorContext,
  ): Promise<IUser> {
    assertOwnerOrAdminOnly(actor, id);
    const existing = await this.loadUser(id);
    const nextBirthDate = params.userData.birthDate ?? existing.birthDate;
    this.assertAdult(nextBirthDate);

    const nextEmail = params.userData.email
      ? params.userData.email.trim().toLowerCase()
      : existing.email;
    const nextCpf = params.userData.cpf
      ? params.userData.cpf.replace(/\D/g, '')
      : existing.cpf;

    if (nextEmail !== existing.email) {
      await this.assertUniqueEmail(nextEmail, id);
    }
    if (nextCpf !== existing.cpf) {
      await this.assertUniqueCpf(nextCpf, id);
    }

    const actorIsAdmin = isAdmin(actor);
    const nextVerified =
      actorIsAdmin && params.userData.verified !== undefined
        ? params.userData.verified
        : existing.verified;
    const nextPhoneVerified =
      actorIsAdmin && params.userData.phoneVerified !== undefined
        ? params.userData.phoneVerified
        : existing.phoneVerified;
    const nextStatus =
      actorIsAdmin && params.userData.status !== undefined
        ? params.userData.status
        : existing.status;

    const candidate = this.buildUserEntity({
      ...existing,
      email: nextEmail,
      cpf: nextCpf,
      birthDate: nextBirthDate,
      fullName: params.userData.fullName ?? existing.fullName,
      phone: params.userData.phone ?? existing.phone,
      verified: nextVerified,
      phoneVerified: nextPhoneVerified,
      status: nextStatus,
    });

    const updated = await this.userRepositoryWrite.updateUserById(id, {
      fullName: candidate.fullName,
      email: candidate.email,
      phone: candidate.phone,
      cpf: candidate.cpf,
      birthDate: candidate.birthDate,
      verified: candidate.verified,
      phoneVerified: candidate.phoneVerified,
      status: candidate.status,
    });

    if (!updated) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'User not found',
        details: { id },
      } as IThrowedError;
    }
    return updated;
  }

  async deleteUserById(id: string, actor: IActorContext): Promise<IUser> {
    assertOwnerOrAdminOnly(actor, id);
    const user = await this.loadUser(id);
    await this.userRepositoryWrite.deleteUserById(id);
    return user;
  }

  async listUsers(filter: Partial<IUser> = {}): Promise<IUser[]> {
    return this.userRepositoryRead.listUsers(filter);
  }

  async getUserSummary(userId: string): Promise<IUserSummary | null> {
    const user = await this.userRepositoryRead.findUserById(userId);
    if (!user) {
      return null;
    }
    return {
      userId: user.id,
      name: user.fullName,
      verified: user.verified,
    };
  }

  async verifyUser(userId: string): Promise<IUser> {
    await this.loadUser(userId);
    const updated = await this.userRepositoryWrite.updateUserById(userId, {
      verified: true,
      status: EUserStatus.ACTIVE,
    });
    if (!updated) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'User not found',
        details: { id: userId },
      } as IThrowedError;
    }

    await this.eventPublisher.publish(
      createEventEnvelope({
        eventId: randomUUID(),
        eventType: 'identity.user.verified',
        aggregateId: updated.id,
        producerModule: 'identity',
        correlationId: randomUUID(),
        payload: { userId: updated.id },
      }),
    );

    return updated;
  }

  async verifyPhone(userId: string): Promise<IUser> {
    await this.loadUser(userId);
    const updated = await this.userRepositoryWrite.updateUserById(userId, {
      phoneVerified: true,
    });
    if (!updated) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'User not found',
        details: { id: userId },
      } as IThrowedError;
    }
    return updated;
  }

  private async loadUser(id: string): Promise<IUser> {
    const user = await this.userRepositoryRead.findUserById(id);
    if (!user) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'User not found',
        details: { id },
      } as IThrowedError;
    }
    return user;
  }

  private buildUserEntity(user: IUser): UserServiceEntity {
    try {
      return new UserServiceEntity(user);
    } catch (error) {
      throw {
        status: 400,
        errorCode: EErrorCode.FIELD_INVALID,
        message:
          error instanceof Error ? error.message : 'Invalid user fields',
      } as IThrowedError;
    }
  }

  private assertAdult(birthDate: string): void {
    if (this.calculateAge(birthDate) < 18) {
      throw {
        status: 400,
        errorCode: EErrorCode.USER_UNDERAGE,
        message: 'User must be at least 18 years old',
        details: { birthDate },
      } as IThrowedError;
    }
  }

  private calculateAge(birthDate: string): number {
    const birth = new Date(`${birthDate}T00:00:00.000Z`);
    const today = new Date();
    let age = today.getUTCFullYear() - birth.getUTCFullYear();
    const monthDiff = today.getUTCMonth() - birth.getUTCMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getUTCDate() < birth.getUTCDate())
    ) {
      age -= 1;
    }
    return age;
  }

  private async assertUniqueEmail(
    email: string,
    excludeId?: string,
  ): Promise<void> {
    const existing = await this.userRepositoryRead.findUserByEmail(email);
    if (existing && existing.id !== excludeId) {
      throw {
        status: 409,
        errorCode: EErrorCode.RESOURCE_CONFLICT,
        message: 'A user with this email already exists',
        details: { email },
      } as IThrowedError;
    }
  }

  private async assertUniqueCpf(
    cpf: string,
    excludeId?: string,
  ): Promise<void> {
    const existing = await this.userRepositoryRead.findUserByCpf(cpf);
    if (existing && existing.id !== excludeId) {
      throw {
        status: 409,
        errorCode: EErrorCode.RESOURCE_CONFLICT,
        message: 'A user with this CPF already exists',
        details: { cpf },
      } as IThrowedError;
    }
  }
}
