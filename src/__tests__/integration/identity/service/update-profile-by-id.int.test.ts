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

describe('when we update a profile by id', () => {
  it('should return the updated profile', async () => {
    const user = await userService.createUser(validUserMock());
    const created = await profileService.createProfile(
      validProfileMock({ userId: user.id }),
      sellerActor(user.id),
    );

    const result = await profileService.updateProfileById(
      created.id,
      { profileData: { displayName: 'Updated Display', bio: 'New bio' } },
      sellerActor(user.id),
    );

    expect(result).toMatchObject({
      id: created.id,
      userId: user.id,
      displayName: 'Updated Display',
      bio: 'New bio',
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

    await profileService.updateProfileById(
      created.id,
      { profileData: { locationApprox: 'Campinas, SP' } },
      sellerActor(user.id),
    );

    expect(publishSpy).toHaveBeenCalledTimes(1);
    expect(publishSpy.mock.calls[0][0]).toMatchObject({
      eventType: 'identity.profile.updated',
      aggregateId: created.id,
      payload: {
        userId: user.id,
        profileId: created.id,
        locationApprox: 'Campinas, SP',
      },
    });

    publishSpy.mockRestore();
  });
});

describe('when we update a profile by a missing id', () => {
  it('should reject with RESOURCE_NOT_FOUND and not publish', async () => {
    const publishSpy = jest
      .spyOn(EventPublisherFactory.create(), 'publish')
      .mockResolvedValue(undefined);
    publishSpy.mockClear();

    const missingId = new Types.ObjectId().toHexString();
    const actorId = new Types.ObjectId().toHexString();

    await expect(
      profileService.updateProfileById(
        missingId,
        { profileData: { displayName: 'Nope' } },
        sellerActor(actorId),
      ),
    ).rejects.toMatchObject({
      status: 404,
      errorCode: EErrorCode.RESOURCE_NOT_FOUND,
      details: { id: missingId },
    });
    expect(publishSpy).not.toHaveBeenCalled();

    publishSpy.mockRestore();
  });
});

describe('when we update a profile by id with an invalid address', () => {
  it('should reject with ADDRESS_INVALID_ZIP_CODE and not publish', async () => {
    const publishSpy = jest
      .spyOn(EventPublisherFactory.create(), 'publish')
      .mockResolvedValue(undefined);

    const user = await userService.createUser(validUserMock());
    const created = await profileService.createProfile(
      validProfileMock({ userId: user.id }),
      sellerActor(user.id),
    );
    publishSpy.mockClear();

    const badAddress = validAddressMock({ postalCode: '123' });

    await expect(
      profileService.updateProfileById(
        created.id,
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
      errorCode: EErrorCode.ADDRESS_INVALID_ZIP_CODE,
    });
    expect(publishSpy).not.toHaveBeenCalled();

    publishSpy.mockRestore();
  });
});

describe('when we update a profile by id as a non-owner', () => {
  it('should reject with FIELD_INVALID', async () => {
    const user = await userService.createUser(validUserMock());
    const created = await profileService.createProfile(
      validProfileMock({ userId: user.id }),
      sellerActor(user.id),
    );

    await expect(
      profileService.updateProfileById(
        created.id,
        { profileData: { displayName: 'Hacker' } },
        sellerActor(new Types.ObjectId().toHexString()),
      ),
    ).rejects.toMatchObject({
      status: 403,
      errorCode: EErrorCode.FIELD_INVALID,
    });
  });
});
