import { Types } from 'mongoose';
import { ProfileServiceFactory } from '../../../../configuration/factory/profile.service.factory';
import { UserServiceFactory } from '../../../../configuration/factory/user.service.factory';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { ProfileService } from '../../../../domain/identity/service/profile.service';
import { ProfileRepositoryRead } from '../../../../infraestructure/repository/identity/profile.repository.read';
import { ProfileRepositoryWrite } from '../../../../infraestructure/repository/identity/profile.repository.write';
import { UserRepositoryRead } from '../../../../infraestructure/repository/identity/user.repository.read';
import {
  validAddressMock,
  validProfileMock,
} from '../../../__mocks__/profile.mock';
import { sellerActor } from '../../../__mocks__/actor.mock';
import { validUserMock } from '../../../__mocks__/user.mock';

const userService = UserServiceFactory.create();
const profileService = ProfileServiceFactory.create();

describe('when we create a profile with an address for an existing user', () => {
  it('should return the created profile', async () => {
    const user = await userService.createUser(validUserMock());
    const address = validAddressMock();
    const profile = validProfileMock({
      userId: user.id,
      addresses: [address],
      defaultShippingAddressId: address.id,
    });

    const result = await profileService.createProfile(profile, sellerActor(user.id));

    expect(result).toMatchObject({
      id: profile.id,
      userId: user.id,
      locationApprox: profile.locationApprox,
      addresses: [
        expect.objectContaining({
          postalCode: address.postalCode,
          street: address.street,
          state: 'SP',
        }),
      ],
    });
  });
});

describe('when we create a profile for a missing user', () => {
  it('should reject with RESOURCE_NOT_FOUND', async () => {
    const missingUserId = new Types.ObjectId().toHexString();
    await expect(
      profileService.createProfile(
        validProfileMock({
          userId: missingUserId,
        }),
        sellerActor(missingUserId),
      ),
    ).rejects.toMatchObject({
      status: 404,
      errorCode: EErrorCode.RESOURCE_NOT_FOUND,
    });
  });
});

describe('when we create a second profile for the same user', () => {
  it('should reject with RESOURCE_CONFLICT', async () => {
    const user = await userService.createUser(validUserMock());
    await profileService.createProfile(
      validProfileMock({ userId: user.id }),
      sellerActor(user.id),
    );

    await expect(
      profileService.createProfile(
        validProfileMock({
          id: new Types.ObjectId().toHexString(),
          userId: user.id,
        }),
        sellerActor(user.id),
      ),
    ).rejects.toMatchObject({
      status: 409,
      errorCode: EErrorCode.RESOURCE_CONFLICT,
    });
  });
});

describe('when we update a profile', () => {
  it('should publish identity.profile.updated without street PII', async () => {
    const user = await userService.createUser(validUserMock());
    const created = await profileService.createProfile(
      validProfileMock({ userId: user.id }),
      sellerActor(user.id),
    );

    const publisher = {
      publish: jest.fn().mockResolvedValue(undefined),
    };
    const service = new ProfileService({
      profileRepositoryRead: new ProfileRepositoryRead(),
      profileRepositoryWrite: new ProfileRepositoryWrite(),
      userRepositoryRead: new UserRepositoryRead(),
      eventPublisher: publisher,
      cepLookup: { lookup: async () => null },
      geocoder: { geocode: async () => null },
    });

    await service.updateProfileById(
      created.id,
      {
        profileData: { locationApprox: 'Campinas, SP' },
      },
      sellerActor(user.id),
    );

    expect(publisher.publish).toHaveBeenCalledTimes(1);
    const envelope = publisher.publish.mock.calls[0][0];
    expect(envelope).toMatchObject({
      eventType: 'identity.profile.updated',
      payload: {
        userId: user.id,
        profileId: created.id,
        locationApprox: 'Campinas, SP',
      },
    });
    expect(JSON.stringify(envelope.payload)).not.toContain('Avenida');
    expect(envelope.payload).not.toHaveProperty('addresses');
  });
});
