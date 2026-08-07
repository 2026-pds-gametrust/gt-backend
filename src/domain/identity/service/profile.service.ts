import { IThrowedError } from '@sauvvitech/st-packages';
import { randomUUID } from 'crypto';
import { assertOwnerOrAdmin } from '../../common/auth/actor-authorization';
import { EErrorCode } from '../../common/errors/enums/EErrorCode';
import { createEventEnvelope } from '../../common/messaging/event-envelope';
import { IEventPublisher } from '../../common/messaging/event-publisher.interface';
import { IActorContext } from '../../common/types/actor-context';
import { ProfileServiceEntity } from '../entity/profile.entity';
import { IAddress } from '../entity/interfaces/address.interface';
import { IProfile } from '../entity/interfaces/profile.interface';
import { IProfileRepositoryRead } from '../repository/profile.repository.read';
import { IProfileRepositoryWrite } from '../repository/profile.repository.write';
import { IUserRepositoryRead } from '../repository/user.repository.read';
import {
  IParamsCreateProfile,
  IParamsProfileService,
  IParamsUpdateProfile,
  IProfileService,
} from './profile.service.interface';

export class ProfileService implements IProfileService {
  private readonly profileRepositoryRead: IProfileRepositoryRead;
  private readonly profileRepositoryWrite: IProfileRepositoryWrite;
  private readonly userRepositoryRead: IUserRepositoryRead;
  private readonly eventPublisher: IEventPublisher;

  constructor({
    profileRepositoryRead,
    profileRepositoryWrite,
    userRepositoryRead,
    eventPublisher,
  }: IParamsProfileService) {
    this.profileRepositoryRead = profileRepositoryRead;
    this.profileRepositoryWrite = profileRepositoryWrite;
    this.userRepositoryRead = userRepositoryRead;
    this.eventPublisher = eventPublisher;
  }

  async createProfile(
    params: IParamsCreateProfile,
    actor: IActorContext,
  ): Promise<IProfile> {
    assertOwnerOrAdmin(actor, params.userId);
    const user = await this.userRepositoryRead.findUserById(params.userId);
    if (!user) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'User not found',
        details: { userId: params.userId },
      } as IThrowedError;
    }

    const existing = await this.profileRepositoryRead.findProfileByUserId(
      params.userId,
    );
    if (existing) {
      throw {
        status: 409,
        errorCode: EErrorCode.RESOURCE_CONFLICT,
        message: 'A profile already exists for this user',
        details: { userId: params.userId },
      } as IThrowedError;
    }

    this.assertAddressesValid(params.addresses ?? [], params.defaultShippingAddressId);

    const entity = new ProfileServiceEntity({
      id: params.id,
      userId: params.userId,
      displayName: params.displayName,
      bio: params.bio,
      locationApprox: params.locationApprox,
      addresses: params.addresses ?? [],
      defaultShippingAddressId: params.defaultShippingAddressId,
      setupItems: params.setupItems,
      createdAt: new Date(),
    });

    return this.profileRepositoryWrite.createProfile(entity);
  }

  async getProfileById(id: string): Promise<IProfile> {
    const profile = await this.profileRepositoryRead.findProfileById(id);
    if (!profile) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Profile not found',
        details: { id },
      } as IThrowedError;
    }
    return profile;
  }

  async getProfileByUserId(userId: string): Promise<IProfile> {
    const profile = await this.profileRepositoryRead.findProfileByUserId(userId);
    if (!profile) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Profile not found',
        details: { userId },
      } as IThrowedError;
    }
    return profile;
  }

  async updateProfileById(
    id: string,
    params: IParamsUpdateProfile,
    actor: IActorContext,
  ): Promise<IProfile> {
    const existing = await this.getProfileById(id);
    assertOwnerOrAdmin(actor, existing.userId);
    return this.applyUpdate(existing, params);
  }

  async updateProfileByUserId(
    userId: string,
    params: IParamsUpdateProfile,
    actor: IActorContext,
  ): Promise<IProfile> {
    const existing = await this.getProfileByUserId(userId);
    assertOwnerOrAdmin(actor, existing.userId);
    return this.applyUpdate(existing, params);
  }

  async listProfiles(filter: Partial<IProfile> = {}): Promise<IProfile[]> {
    return this.profileRepositoryRead.listProfiles(filter);
  }

  private async applyUpdate(
    existing: IProfile,
    params: IParamsUpdateProfile,
  ): Promise<IProfile> {
    const nextAddresses = params.profileData.addresses ?? existing.addresses;
    const nextDefault =
      params.profileData.defaultShippingAddressId !== undefined
        ? params.profileData.defaultShippingAddressId
        : existing.defaultShippingAddressId;

    this.assertAddressesValid(nextAddresses, nextDefault);

    const candidate = new ProfileServiceEntity({
      ...existing,
      ...params.profileData,
      addresses: nextAddresses,
      defaultShippingAddressId: nextDefault,
    });

    const updated = await this.profileRepositoryWrite.updateProfileById(
      existing.id,
      {
        displayName: candidate.displayName,
        bio: candidate.bio,
        locationApprox: candidate.locationApprox,
        addresses: candidate.addresses,
        defaultShippingAddressId: candidate.defaultShippingAddressId,
        setupItems: candidate.setupItems,
      },
    );

    if (!updated) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Profile not found',
        details: { id: existing.id },
      } as IThrowedError;
    }

    await this.eventPublisher.publish(
      createEventEnvelope({
        eventId: randomUUID(),
        eventType: 'identity.profile.updated',
        aggregateId: updated.id,
        producerModule: 'identity',
        correlationId: randomUUID(),
        payload: {
          userId: updated.userId,
          profileId: updated.id,
          locationApprox: updated.locationApprox ?? null,
        },
      }),
    );

    return updated;
  }

  private assertAddressesValid(
    addresses: IAddress[],
    defaultShippingAddressId?: string,
  ): void {
    for (const address of addresses) {
      const cep = address.postalCode?.replace(/\D/g, '') ?? '';
      if (!/^\d{8}$/.test(cep)) {
        throw {
          status: 400,
          errorCode: EErrorCode.ADDRESS_INVALID_ZIP_CODE,
          message: 'postalCode must be 8 digits',
          details: { postalCode: address.postalCode },
        } as IThrowedError;
      }
      if (!address.state?.trim() || address.state.trim().length !== 2) {
        throw {
          status: 400,
          errorCode: EErrorCode.ADDRESS_INVALID_STATE,
          message: 'state must be 2 letters',
          details: { state: address.state },
        } as IThrowedError;
      }
      if (!address.number?.trim()) {
        throw {
          status: 400,
          errorCode: EErrorCode.ADDRESS_INVALID_NUMBER,
          message: 'number is required',
          details: { addressId: address.id },
        } as IThrowedError;
      }
      if (
        !address.recipientName?.trim() ||
        !address.street?.trim() ||
        !address.district?.trim() ||
        !address.city?.trim()
      ) {
        throw {
          status: 400,
          errorCode: EErrorCode.FIELD_INVALID,
          message: 'Address fields are invalid',
          details: { addressId: address.id },
        } as IThrowedError;
      }
    }

    if (
      defaultShippingAddressId &&
      !addresses.some((a) => a.id === defaultShippingAddressId)
    ) {
      throw {
        status: 400,
        errorCode: EErrorCode.FIELD_INVALID,
        message: 'defaultShippingAddressId must match an address id',
        details: { defaultShippingAddressId },
      } as IThrowedError;
    }
  }
}
