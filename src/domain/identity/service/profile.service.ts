import { IThrowedError } from '@sauvvitech/st-packages';
import { randomUUID } from 'crypto';
import { Logger } from 'traceability';
import {
  GEO_NEAR_DEFAULT_LIMIT,
  GEO_NEAR_MAX_LIMIT,
  GEO_NEAR_MAX_RADIUS_METERS,
} from '../../../configuration/env-constants/maps.env';
import {
  assertActorPresent,
  assertOwnerOrAdmin,
  isBackofficeOrAdmin,
} from '../../common/auth/actor-authorization';
import { EErrorCode } from '../../common/errors/enums/EErrorCode';
import { createEventEnvelope } from '../../common/messaging/event-envelope';
import { IEventPublisher } from '../../common/messaging/event-publisher.interface';
import { IActorContext } from '../../common/types/actor-context';
import { isBlank } from '../../common/types/required-string';
import { EGeoSource } from '../entity/enums/EGeoSource';
import { ProfileServiceEntity } from '../entity/profile.entity';
import { IAddress } from '../entity/interfaces/address.interface';
import { IProfile } from '../entity/interfaces/profile.interface';
import { ICepLookup } from '../ports/cep-lookup.interface';
import { IGeocoder } from '../ports/geocoder.interface';
import { IProfileRepositoryRead } from '../repository/profile.repository.read';
import { IProfileRepositoryWrite } from '../repository/profile.repository.write';
import { IUserRepositoryRead } from '../repository/user.repository.read';
import {
  IParamsCreateProfile,
  IParamsFindProfilesNear,
  IParamsProfileService,
  IParamsUpdateProfile,
  IProfileNearPublic,
  IProfileService,
} from './profile.service.interface';

export class ProfileService implements IProfileService {
  private readonly profileRepositoryRead: IProfileRepositoryRead;
  private readonly profileRepositoryWrite: IProfileRepositoryWrite;
  private readonly userRepositoryRead: IUserRepositoryRead;
  private readonly eventPublisher: IEventPublisher;
  private readonly cepLookup: ICepLookup;
  private readonly geocoder: IGeocoder;

  constructor({
    profileRepositoryRead,
    profileRepositoryWrite,
    userRepositoryRead,
    eventPublisher,
    cepLookup,
    geocoder,
  }: IParamsProfileService) {
    this.profileRepositoryRead = profileRepositoryRead;
    this.profileRepositoryWrite = profileRepositoryWrite;
    this.userRepositoryRead = userRepositoryRead;
    this.eventPublisher = eventPublisher;
    this.cepLookup = cepLookup;
    this.geocoder = geocoder;
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

    const addresses = params.addresses ?? [];
    this.assertAddressesValid(addresses, params.defaultShippingAddressId, {
      requireAtLeastOne: !params.allowEmptyAddresses,
    });

    const enrichedAddresses = await this.enrichAddresses(addresses);
    const locationApprox =
      params.locationApprox?.trim() ||
      this.deriveLocationApprox(enrichedAddresses);

    const entity = new ProfileServiceEntity({
      id: params.id,
      userId: params.userId,
      displayName: params.displayName,
      bio: params.bio,
      locationApprox,
      addresses: enrichedAddresses,
      defaultShippingAddressId: params.defaultShippingAddressId,
      setupItems: params.setupItems,
      createdAt: new Date(),
    });

    return this.profileRepositoryWrite.createProfile(entity);
  }

  async getProfileById(
    id: string,
    actor?: IActorContext,
  ): Promise<IProfile> {
    const profile = await this.profileRepositoryRead.findProfileById(id);
    if (!profile) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Profile not found',
        details: { id },
      } as IThrowedError;
    }
    return this.projectForViewer(profile, actor);
  }

  async getProfileByUserId(
    userId: string,
    actor?: IActorContext,
  ): Promise<IProfile> {
    const profile =
      await this.profileRepositoryRead.findProfileByUserId(userId);
    if (!profile) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Profile not found',
        details: { userId },
      } as IThrowedError;
    }
    return this.projectForViewer(profile, actor);
  }

  async updateProfileById(
    id: string,
    params: IParamsUpdateProfile,
    actor: IActorContext,
  ): Promise<IProfile> {
    const existing = await this.loadProfileById(id);
    assertOwnerOrAdmin(actor, existing.userId);
    return this.applyUpdate(existing, params);
  }

  async updateProfileByUserId(
    userId: string,
    params: IParamsUpdateProfile,
    actor: IActorContext,
  ): Promise<IProfile> {
    const existing = await this.loadProfileByUserId(userId);
    assertOwnerOrAdmin(actor, existing.userId);
    return this.applyUpdate(existing, params);
  }

  async listProfiles(filter: Partial<IProfile> = {}): Promise<IProfile[]> {
    return this.profileRepositoryRead.listProfiles(filter);
  }

  async getMyProfile(actor: IActorContext): Promise<IProfile> {
    assertActorPresent(actor);
    return this.getProfileByUserId(actor.actorId, actor);
  }

  async findProfilesNear(
    params: IParamsFindProfilesNear,
  ): Promise<IProfileNearPublic[]> {
    const lng = Number(params.lng);
    const lat = Number(params.lat);
    if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
      throw {
        status: 400,
        errorCode: EErrorCode.FIELD_INVALID,
        message: 'lng must be a number between -180 and 180',
      } as IThrowedError;
    }
    if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
      throw {
        status: 400,
        errorCode: EErrorCode.FIELD_INVALID,
        message: 'lat must be a number between -90 and 90',
      } as IThrowedError;
    }

    const requestedRadius = Number(
      params.radiusMeters ?? GEO_NEAR_MAX_RADIUS_METERS,
    );
    if (!Number.isFinite(requestedRadius) || requestedRadius <= 0) {
      throw {
        status: 400,
        errorCode: EErrorCode.FIELD_INVALID,
        message: 'radiusMeters must be a positive number',
      } as IThrowedError;
    }
    const maxDistanceMeters = Math.min(
      requestedRadius,
      GEO_NEAR_MAX_RADIUS_METERS,
    );

    const requestedLimit = Number(params.limit ?? GEO_NEAR_DEFAULT_LIMIT);
    if (!Number.isFinite(requestedLimit) || requestedLimit <= 0) {
      throw {
        status: 400,
        errorCode: EErrorCode.FIELD_INVALID,
        message: 'limit must be a positive number',
      } as IThrowedError;
    }
    const limit = Math.min(Math.floor(requestedLimit), GEO_NEAR_MAX_LIMIT);

    const hits = await this.profileRepositoryRead.findNear({
      lng,
      lat,
      maxDistanceMeters,
      limit,
    });

    return hits.map(({ profile, distanceMeters }) => {
      const publicProfile = this.toPublicProfile(profile);
      return {
        id: publicProfile.id,
        userId: publicProfile.userId,
        displayName: publicProfile.displayName,
        bio: publicProfile.bio,
        locationApprox: publicProfile.locationApprox,
        createdAt: publicProfile.createdAt,
        updatedAt: publicProfile.updatedAt,
        distanceMeters,
      };
    });
  }

  private async loadProfileById(id: string): Promise<IProfile> {
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

  private async loadProfileByUserId(userId: string): Promise<IProfile> {
    const profile =
      await this.profileRepositoryRead.findProfileByUserId(userId);
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

  private async applyUpdate(
    existing: IProfile,
    params: IParamsUpdateProfile,
  ): Promise<IProfile> {
    const addressesProvided = params.profileData.addresses !== undefined;
    const nextAddresses = addressesProvided
      ? (params.profileData.addresses as IAddress[])
      : existing.addresses;
    const nextDefault =
      params.profileData.defaultShippingAddressId !== undefined
        ? params.profileData.defaultShippingAddressId
        : existing.defaultShippingAddressId;

    this.assertAddressesValid(nextAddresses, nextDefault, {
      requireAtLeastOne: addressesProvided,
    });

    const enrichedAddresses = addressesProvided
      ? await this.enrichAddresses(nextAddresses)
      : nextAddresses;

    let locationApprox =
      params.profileData.locationApprox !== undefined
        ? params.profileData.locationApprox
        : existing.locationApprox;
    if (
      addressesProvided &&
      (params.profileData.locationApprox === undefined ||
        isBlank(params.profileData.locationApprox))
    ) {
      locationApprox =
        this.deriveLocationApprox(enrichedAddresses) ?? locationApprox;
    }

    const candidate = new ProfileServiceEntity({
      ...existing,
      ...params.profileData,
      locationApprox,
      addresses: enrichedAddresses,
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

  private async enrichAddresses(addresses: IAddress[]): Promise<IAddress[]> {
    const enriched: IAddress[] = [];
    for (const address of addresses) {
      enriched.push(await this.enrichAddress(address));
    }
    return enriched;
  }

  private async enrichAddress(address: IAddress): Promise<IAddress> {
    const cep = address.postalCode.replace(/\D/g, '');
    let geo = address.geo;
    let geoSource = address.geoSource;

    try {
      const cepResult = await this.cepLookup.lookup(cep);
      if (
        cepResult &&
        cepResult.lat !== undefined &&
        cepResult.lng !== undefined &&
        Number.isFinite(cepResult.lat) &&
        Number.isFinite(cepResult.lng)
      ) {
        geo = {
          type: 'Point',
          coordinates: [cepResult.lng, cepResult.lat],
        };
        geoSource = EGeoSource.BRASIL_API;
      }
    } catch {
      Logger.info('address.enrich.cep.failed');
    }

    if (!geo) {
      try {
        const query = [
          address.street,
          address.number,
          address.district,
          address.city,
          address.state,
          address.country || 'BR',
        ]
          .filter((part) => !isBlank(part))
          .join(', ');
        const point = await this.geocoder.geocode(query);
        if (point) {
          geo = {
            type: 'Point',
            coordinates: [point.lng, point.lat],
          };
          geoSource = EGeoSource.NOMINATIM;
        }
      } catch {
        Logger.info('address.enrich.geocode.failed');
      }
    }

    const result: IAddress = { ...address };
    if (geo) {
      result.geo = geo;
      result.geoSource = geoSource;
    } else {
      delete result.geo;
      delete result.geoSource;
    }
    return result;
  }

  private deriveLocationApprox(addresses: IAddress[]): string | undefined {
    const first = addresses[0];
    if (!first?.city || !first?.state) {
      return undefined;
    }
    return `${first.city}, ${first.state}`;
  }

  private projectForViewer(
    profile: IProfile,
    actor?: IActorContext,
  ): IProfile {
    if (this.canViewFullProfile(profile, actor)) {
      return profile;
    }
    return this.toPublicProfile(profile);
  }

  private canViewFullProfile(
    profile: IProfile,
    actor?: IActorContext,
  ): boolean {
    if (!actor?.actorId?.trim()) {
      return false;
    }
    if (isBackofficeOrAdmin(actor)) {
      return true;
    }
    return actor.actorId === profile.userId;
  }

  private toPublicProfile(profile: IProfile): IProfile {
    return {
      ...profile,
      addresses: (profile.addresses ?? []).map((address) => ({
        id: address.id,
        label: address.label,
        recipientName: address.recipientName,
        postalCode: address.postalCode,
        street: '',
        number: address.number,
        complement: undefined,
        district: address.district,
        city: address.city,
        state: address.state,
        country: address.country,
        isBilling: address.isBilling,
        isShipping: address.isShipping,
      })),
    };
  }

  private assertAddressesValid(
    addresses: IAddress[],
    defaultShippingAddressId?: string,
    options: { requireAtLeastOne: boolean } = { requireAtLeastOne: false },
  ): void {
    if (options.requireAtLeastOne && addresses.length < 1) {
      throw {
        status: 400,
        errorCode: EErrorCode.FIELD_INVALID,
        message: 'At least one complete address is required',
      } as IThrowedError;
    }

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
      if (isBlank(address.number)) {
        throw {
          status: 400,
          errorCode: EErrorCode.ADDRESS_INVALID_NUMBER,
          message: 'number is required',
          details: { addressId: address.id },
        } as IThrowedError;
      }
      if (
        isBlank(address.recipientName) ||
        isBlank(address.street) ||
        isBlank(address.district) ||
        isBlank(address.city)
      ) {
        throw {
          status: 400,
          errorCode: EErrorCode.FIELD_INVALID,
          message: 'Address fields are invalid',
          details: { addressId: address.id },
        } as IThrowedError;
      }
    }

    if (options.requireAtLeastOne && !defaultShippingAddressId) {
      throw {
        status: 400,
        errorCode: EErrorCode.FIELD_INVALID,
        message: 'defaultShippingAddressId is required when addresses are set',
      } as IThrowedError;
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
