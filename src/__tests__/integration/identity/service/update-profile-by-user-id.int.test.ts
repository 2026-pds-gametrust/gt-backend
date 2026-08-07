import { Types } from 'mongoose';
import { EventPublisherFactory } from '../../../../configuration/factory/messaging/event-publisher.factory';
import { ProfileServiceFactory } from '../../../../configuration/factory/profile.service.factory';
import { UserServiceFactory } from '../../../../configuration/factory/user.service.factory';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { sellerActor } from '../../../__mocks__/actor.mock';
import {
  validAddressMock,
  validProfileMock,
} from '../../../__mocks__/profile.mock';
import { validUserMock } from '../../../__mocks__/user.mock';

const userService = UserServiceFactory.create();
const profileService = ProfileServiceFactory.create();

describe('when we update a profile by user id', () => {
  it('should return the updated profile', async () => {
    const user = await userService.createUser(validUserMock());
    const created = await profileService.createProfile(
      validProfileMock({ userId: user.id }),
      sellerActor(user.id),
    );

    const result = await profileService.updateProfileByUserId(
      user.id,
      { profileData: { displayName: 'By User Id', bio: 'Updated via userId' } },
      sellerActor(user.id),
    );

    expect(result).toMatchObject({
      id: created.id,
      userId: user.id,
      displayName: 'By User Id',
      bio: 'Updated via userId',
    });
  });

  it('should publish identity.profile.updated', async () => {
    const publishSpy = jest
      .spyOn(EventPublisherFactory.create(), 'publish')
      .mockResolvedValue(undefined);

    const user = await userService.createUser(validUserMock());
    const created = await profileService.createProfile(
      validProfileMock({ userId: user.id }),
      sellerActor(user.id),
    );
    publishSpy.mockClear();

    await profileService.updateProfileByUserId(
      user.id,
      { profileData: { locationApprox: 'Santos, SP' } },
      sellerActor(user.id),
    );

    expect(publishSpy).toHaveBeenCalledTimes(1);
    expect(publishSpy.mock.calls[0][0]).toMatchObject({
      eventType: 'identity.profile.updated',
      aggregateId: created.id,
      payload: {
        userId: user.id,
        profileId: created.id,
        locationApprox: 'Santos, SP',
      },
    });

    publishSpy.mockRestore();
  });
});

describe('when we update a profile by a user id without profile', () => {
  it('should reject with RESOURCE_NOT_FOUND and not publish', async () => {
    const publishSpy = jest
      .spyOn(EventPublisherFactory.create(), 'publish')
      .mockResolvedValue(undefined);
    publishSpy.mockClear();

    const missingUserId = new Types.ObjectId().toHexString();

    await expect(
      profileService.updateProfileByUserId(
        missingUserId,
        { profileData: { displayName: 'Nope' } },
        sellerActor(missingUserId),
      ),
    ).rejects.toMatchObject({
      status: 404,
      errorCode: EErrorCode.RESOURCE_NOT_FOUND,
      details: { userId: missingUserId },
    });
    expect(publishSpy).not.toHaveBeenCalled();

    publishSpy.mockRestore();
  });
});

describe('when we update a profile by user id with an invalid address', () => {
  it('should reject with ADDRESS_INVALID_STATE and not publish', async () => {
    const publishSpy = jest
      .spyOn(EventPublisherFactory.create(), 'publish')
      .mockResolvedValue(undefined);

    const user = await userService.createUser(validUserMock());
    await profileService.createProfile(
      validProfileMock({ userId: user.id }),
      sellerActor(user.id),
    );
    publishSpy.mockClear();

    const badAddress = validAddressMock({ state: 'SPO' });

    await expect(
      profileService.updateProfileByUserId(
        user.id,
        {
          profileData: {
            addresses: [badAddress],
            defaultShippingAddressId: badAddress.id,
          },
        },
        sellerActor(user.id),
      ),
    ).rejects.toMatchObject({
      status: 400,
      errorCode: EErrorCode.ADDRESS_INVALID_STATE,
    });
    expect(publishSpy).not.toHaveBeenCalled();

    publishSpy.mockRestore();
  });
});
