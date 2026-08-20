import { Types } from 'mongoose';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { IEventPublisher } from '../../../../domain/common/messaging/event-publisher.interface';
import { IProfile } from '../../../../domain/identity/entity/interfaces/profile.interface';
import { IUser } from '../../../../domain/identity/entity/interfaces/user.interface';
import { ProfileService } from '../../../../domain/identity/service/profile.service';
import { sellerActor } from '../../../__mocks__/actor.mock';
import {
  validAddressMock,
  validProfileMock,
} from '../../../__mocks__/profile.mock';
import { validUserMock } from '../../../__mocks__/user.mock';

function buildService(overrides: {
  profiles?: Map<string, IProfile>;
  users?: Map<string, IUser>;
  updateProfileById?: (id: string, data: Partial<IProfile>) => Promise<IProfile | null>;
  cepLookup?: { lookup: jest.Mock };
  geocoder?: { geocode: jest.Mock };
} = {}) {
  const profiles = overrides.profiles ?? new Map<string, IProfile>();
  const users = overrides.users ?? new Map<string, IUser>();
  const publisher: IEventPublisher = {
    publish: jest.fn().mockResolvedValue(undefined),
  };
  const cepLookup = overrides.cepLookup ?? {
    lookup: jest.fn().mockResolvedValue(null),
  };
  const geocoder = overrides.geocoder ?? {
    geocode: jest.fn().mockResolvedValue(null),
  };

  const service = new ProfileService({
    profileRepositoryRead: {
      findProfileById: async (id: string) =>
        [...profiles.values()].find((p) => p.id === id) ?? null,
      findProfileByUserId: async (userId: string) =>
        profiles.get(userId) ?? null,
      findProfilesByUserIds: async (userIds: string[]) =>
        userIds
          .map((userId) => profiles.get(userId))
          .filter((profile): profile is IProfile => profile !== undefined),
      listProfiles: async () => [...profiles.values()],
      findNear: async () => [],
    },
    profileRepositoryWrite: {
      createProfile: async (profile: IProfile) => {
        profiles.set(profile.userId, profile);
        return profile;
      },
      updateProfileById:
        overrides.updateProfileById ??
        (async (id: string, data: Partial<IProfile>) => {
          const existing = [...profiles.values()].find((p) => p.id === id);
          if (!existing) return null;
          const updated = { ...existing, ...data };
          profiles.set(updated.userId, updated);
          return updated;
        }),
      deleteProfileById: async () => null,
    },
    userRepositoryRead: {
      findUserById: async (id: string) => users.get(id) ?? null,
      findUserByEmail: async () => null,
      findUserByCpf: async () => null,
      listUsers: async () => [...users.values()],
      findUserIdsBySearchQuery: async () => [],
      findUsersByIds: async (ids: string[]) =>
        ids
          .map((id) => users.get(id))
          .filter((user): user is IUser => user !== undefined),
    },
    eventPublisher: publisher,
    cepLookup: cepLookup as never,
    geocoder: geocoder as never,
  });

  return { service, profiles, users, publisher, cepLookup, geocoder };
}

describe('when creating a profile without addresses', () => {
  it('should default addresses to an empty list when allowEmptyAddresses', async () => {
    const user = validUserMock();
    const users = new Map([[user.id, user]]);
    const { service } = buildService({ users });

    const created = await service.createProfile(
      {
        id: new Types.ObjectId().toHexString(),
        userId: user.id,
        displayName: 'Solo',
        allowEmptyAddresses: true,
      },
      sellerActor(user.id),
    );

    expect(created.addresses).toEqual([]);
  });

  it('should reject empty addresses for HTTP create', async () => {
    const user = validUserMock();
    const users = new Map([[user.id, user]]);
    const { service } = buildService({ users });

    await expect(
      service.createProfile(
        {
          id: new Types.ObjectId().toHexString(),
          userId: user.id,
          displayName: 'Solo',
          addresses: [],
        },
        sellerActor(user.id),
      ),
    ).rejects.toMatchObject({
      status: 400,
      errorCode: EErrorCode.FIELD_INVALID,
    });
  });
});

describe('when updating a profile by user id as a different actor', () => {
  it('should reject with forbidden', async () => {
    const user = validUserMock();
    const profile = validProfileMock({ userId: user.id });
    const { service, publisher } = buildService({
      users: new Map([[user.id, user]]),
      profiles: new Map([[user.id, profile]]),
    });

    await expect(
      service.updateProfileByUserId(
        user.id,
        { profileData: { displayName: 'Hacker' } },
        sellerActor('other-actor'),
      ),
    ).rejects.toMatchObject({
      status: 403,
      errorCode: EErrorCode.FIELD_INVALID,
    });
    expect(publisher.publish).not.toHaveBeenCalled();
  });
});

describe('when update write returns null', () => {
  it('should reject with RESOURCE_NOT_FOUND and not publish', async () => {
    const user = validUserMock();
    const profile = validProfileMock({ userId: user.id });
    const { service, publisher } = buildService({
      users: new Map([[user.id, user]]),
      profiles: new Map([[user.id, profile]]),
      updateProfileById: async () => null,
    });

    await expect(
      service.updateProfileByUserId(
        user.id,
        { profileData: { displayName: 'Ghost' } },
        sellerActor(user.id),
      ),
    ).rejects.toMatchObject({
      status: 404,
      errorCode: EErrorCode.RESOURCE_NOT_FOUND,
    });
    expect(publisher.publish).not.toHaveBeenCalled();
  });
});

describe('when updating profile addresses fail validation', () => {
  it('should reject invalid postal code', async () => {
    const user = validUserMock();
    const profile = validProfileMock({ userId: user.id });
    const { service } = buildService({
      users: new Map([[user.id, user]]),
      profiles: new Map([[user.id, profile]]),
    });
    const address = validAddressMock({ postalCode: '123' });

    await expect(
      service.updateProfileByUserId(
        user.id,
        {
          profileData: {
            addresses: [address],
            defaultShippingAddressId: address.id,
          },
        },
        sellerActor(user.id),
      ),
    ).rejects.toMatchObject({
      status: 400,
      errorCode: EErrorCode.ADDRESS_INVALID_ZIP_CODE,
    });
  });

  it('should reject undefined postal code', async () => {
    const user = validUserMock();
    const profile = validProfileMock({ userId: user.id });
    const { service } = buildService({
      users: new Map([[user.id, user]]),
      profiles: new Map([[user.id, profile]]),
    });
    const address = validAddressMock({ postalCode: undefined as never });

    await expect(
      service.updateProfileByUserId(
        user.id,
        {
          profileData: {
            addresses: [address],
            defaultShippingAddressId: address.id,
          },
        },
        sellerActor(user.id),
      ),
    ).rejects.toMatchObject({
      status: 400,
      errorCode: EErrorCode.ADDRESS_INVALID_ZIP_CODE,
    });
  });

  it('should reject empty state', async () => {
    const user = validUserMock();
    const profile = validProfileMock({ userId: user.id });
    const { service } = buildService({
      users: new Map([[user.id, user]]),
      profiles: new Map([[user.id, profile]]),
    });
    const address = validAddressMock({ state: '  ' });

    await expect(
      service.updateProfileByUserId(
        user.id,
        {
          profileData: {
            addresses: [address],
            defaultShippingAddressId: address.id,
          },
        },
        sellerActor(user.id),
      ),
    ).rejects.toMatchObject({
      status: 400,
      errorCode: EErrorCode.ADDRESS_INVALID_STATE,
    });
  });

  it('should reject missing number', async () => {
    const user = validUserMock();
    const profile = validProfileMock({ userId: user.id });
    const { service } = buildService({
      users: new Map([[user.id, user]]),
      profiles: new Map([[user.id, profile]]),
    });
    const address = validAddressMock({ number: '  ' });

    await expect(
      service.updateProfileByUserId(
        user.id,
        {
          profileData: {
            addresses: [address],
            defaultShippingAddressId: address.id,
          },
        },
        sellerActor(user.id),
      ),
    ).rejects.toMatchObject({
      status: 400,
      errorCode: EErrorCode.ADDRESS_INVALID_NUMBER,
    });
  });

  it.each([
    { field: 'recipientName', override: { recipientName: '' } },
    { field: 'street', override: { street: '  ' } },
    { field: 'district', override: { district: '' } },
    { field: 'city', override: { city: '' } },
  ])(
    'should reject missing $field while other address fields remain valid',
    async ({ override }) => {
      const user = validUserMock();
      const profile = validProfileMock({ userId: user.id });
      const { service } = buildService({
        users: new Map([[user.id, user]]),
        profiles: new Map([[user.id, profile]]),
      });
      const address = validAddressMock(override);

      await expect(
        service.updateProfileByUserId(
          user.id,
          {
            profileData: {
              addresses: [address],
              defaultShippingAddressId: address.id,
            },
          },
          sellerActor(user.id),
        ),
      ).rejects.toMatchObject({
        status: 400,
        errorCode: EErrorCode.FIELD_INVALID,
        message: 'Address fields are invalid',
      });
    },
  );

  it.each([
    { field: 'recipientName', override: { recipientName: undefined as never } },
    { field: 'street', override: { street: undefined as never } },
    { field: 'district', override: { district: undefined as never } },
    { field: 'city', override: { city: undefined as never } },
  ])(
    'should reject undefined $field while other address fields remain valid',
    async ({ override }) => {
      const user = validUserMock();
      const profile = validProfileMock({ userId: user.id });
      const { service } = buildService({
        users: new Map([[user.id, user]]),
        profiles: new Map([[user.id, profile]]),
      });
      const address = validAddressMock(override);

      await expect(
        service.updateProfileByUserId(
          user.id,
          {
            profileData: {
              addresses: [address],
              defaultShippingAddressId: address.id,
            },
          },
          sellerActor(user.id),
        ),
      ).rejects.toMatchObject({
        status: 400,
        errorCode: EErrorCode.FIELD_INVALID,
        message: 'Address fields are invalid',
      });
    },
  );

  it('should reject undefined state and undefined number', async () => {
    const user = validUserMock();
    const profile = validProfileMock({ userId: user.id });
    const { service } = buildService({
      users: new Map([[user.id, user]]),
      profiles: new Map([[user.id, profile]]),
    });

    await expect(
      service.updateProfileByUserId(
        user.id,
        {
          profileData: {
            addresses: [validAddressMock({ state: undefined as never })],
          },
        },
        sellerActor(user.id),
      ),
    ).rejects.toMatchObject({
      status: 400,
      errorCode: EErrorCode.ADDRESS_INVALID_STATE,
    });

    await expect(
      service.updateProfileByUserId(
        user.id,
        {
          profileData: {
            addresses: [validAddressMock({ number: undefined as never })],
          },
        },
        sellerActor(user.id),
      ),
    ).rejects.toMatchObject({
      status: 400,
      errorCode: EErrorCode.ADDRESS_INVALID_NUMBER,
    });
  });

  it('should reject defaultShippingAddressId that does not match', async () => {
    const user = validUserMock();
    const profile = validProfileMock({ userId: user.id });
    const { service } = buildService({
      users: new Map([[user.id, user]]),
      profiles: new Map([[user.id, profile]]),
    });
    const address = validAddressMock();

    await expect(
      service.updateProfileByUserId(
        user.id,
        {
          profileData: {
            addresses: [address],
            defaultShippingAddressId: 'missing-address',
          },
        },
        sellerActor(user.id),
      ),
    ).rejects.toMatchObject({
      status: 400,
      errorCode: EErrorCode.FIELD_INVALID,
      message: 'defaultShippingAddressId must match an address id',
    });
  });
});

describe('when updating a profile successfully by user id', () => {
  it('should publish identity.profile.updated', async () => {
    const user = validUserMock();
    const profile = validProfileMock({ userId: user.id });
    const { service, publisher } = buildService({
      users: new Map([[user.id, user]]),
      profiles: new Map([[user.id, profile]]),
    });

    const updated = await service.updateProfileByUserId(
      user.id,
      { profileData: { bio: 'Updated bio', locationApprox: 'Campinas' } },
      sellerActor(user.id),
    );

    expect(updated.bio).toBe('Updated bio');
    expect(publisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'identity.profile.updated',
        payload: expect.objectContaining({
          userId: user.id,
          profileId: profile.id,
          locationApprox: 'Campinas',
        }),
      }),
    );
  });
});

describe('when enriching addresses on create/update', () => {
  it('should set geo from BrasilAPI when location is present', async () => {
    const user = validUserMock();
    const address = validAddressMock({ complement: undefined });
    const { service, cepLookup, geocoder } = buildService({
      users: new Map([[user.id, user]]),
      cepLookup: {
        lookup: jest.fn().mockResolvedValue({
          postalCode: address.postalCode,
          city: address.city,
          state: address.state,
          lat: -23.56,
          lng: -46.65,
        }),
      },
    });

    const created = await service.createProfile(
      {
        id: new Types.ObjectId().toHexString(),
        userId: user.id,
        addresses: [address],
        defaultShippingAddressId: address.id,
      },
      sellerActor(user.id),
    );

    expect(created.addresses[0].geo).toEqual({
      type: 'Point',
      coordinates: [-46.65, -23.56],
    });
    expect(created.addresses[0].geoSource).toBe('BRASIL_API');
    expect(geocoder.geocode).not.toHaveBeenCalled();
    expect(cepLookup.lookup).toHaveBeenCalled();
  });

  it('should fallback to Nominatim when BrasilAPI has no coordinates', async () => {
    const user = validUserMock();
    const address = validAddressMock();
    const { service, geocoder } = buildService({
      users: new Map([[user.id, user]]),
      cepLookup: {
        lookup: jest.fn().mockResolvedValue({
          postalCode: address.postalCode,
          city: address.city,
          state: address.state,
        }),
      },
      geocoder: {
        geocode: jest.fn().mockResolvedValue({ lat: -23.5, lng: -46.6 }),
      },
    });

    const created = await service.createProfile(
      {
        id: new Types.ObjectId().toHexString(),
        userId: user.id,
        addresses: [address],
        defaultShippingAddressId: address.id,
      },
      sellerActor(user.id),
    );

    expect(created.addresses[0].geo).toEqual({
      type: 'Point',
      coordinates: [-46.6, -23.5],
    });
    expect(created.addresses[0].geoSource).toBe('NOMINATIM');
    expect(geocoder.geocode).toHaveBeenCalled();
  });

  it('should persist without geo when both lookups fail', async () => {
    const user = validUserMock();
    const address = validAddressMock();
    const { service } = buildService({
      users: new Map([[user.id, user]]),
      cepLookup: {
        lookup: jest.fn().mockRejectedValue({ status: 502, errorCode: 'MAPS_ERROR' }),
      },
      geocoder: {
        geocode: jest.fn().mockRejectedValue({ status: 502, errorCode: 'MAPS_ERROR' }),
      },
    });

    const created = await service.createProfile(
      {
        id: new Types.ObjectId().toHexString(),
        userId: user.id,
        addresses: [address],
        defaultShippingAddressId: address.id,
      },
      sellerActor(user.id),
    );

    expect(created.addresses[0].geo).toBeUndefined();
    expect(created.addresses[0].geoSource).toBeUndefined();
  });
});

describe('when projecting profile for viewers', () => {
  it('should hide street and geo for anonymous viewers', async () => {
    const user = validUserMock();
    const address = validAddressMock({
      geo: { type: 'Point', coordinates: [-46.65, -23.56] },
      geoSource: 'BRASIL_API' as never,
    });
    const profile = validProfileMock({
      userId: user.id,
      addresses: [address],
      defaultShippingAddressId: address.id,
    });
    const { service } = buildService({
      profiles: new Map([[user.id, profile]]),
    });

    const publicView = await service.getProfileByUserId(user.id);

    expect(publicView.addresses[0].street).toBe('');
    expect(publicView.addresses[0].geo).toBeUndefined();
    expect(publicView.addresses[0].geoSource).toBeUndefined();
    expect(publicView.addresses[0].city).toBe(address.city);
  });

  it('should return full address for the owner', async () => {
    const user = validUserMock();
    const address = validAddressMock({
      geo: { type: 'Point', coordinates: [-46.65, -23.56] },
      geoSource: 'BRASIL_API' as never,
    });
    const profile = validProfileMock({
      userId: user.id,
      addresses: [address],
      defaultShippingAddressId: address.id,
    });
    const { service } = buildService({
      profiles: new Map([[user.id, profile]]),
    });

    const ownerView = await service.getProfileByUserId(
      user.id,
      sellerActor(user.id),
    );

    expect(ownerView.addresses[0].street).toBe(address.street);
    expect(ownerView.addresses[0].geo).toEqual(address.geo);
  });
});
