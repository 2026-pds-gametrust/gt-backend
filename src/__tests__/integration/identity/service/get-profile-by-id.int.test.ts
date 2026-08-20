import { Types } from 'mongoose';
import { ProfileServiceFactory } from '../../../../configuration/factory/profile.service.factory';
import { UserServiceFactory } from '../../../../configuration/factory/user.service.factory';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { sellerActor } from '../../../__mocks__/actor.mock';
import { validProfileMock } from '../../../__mocks__/profile.mock';
import { validUserMock } from '../../../__mocks__/user.mock';

const userService = UserServiceFactory.create();
const profileService = ProfileServiceFactory.create();

describe('when we get a profile by id', () => {
  it('should return the profile', async () => {
    const user = await userService.createUser(validUserMock());
    const created = await profileService.createProfile(
      validProfileMock({ userId: user.id }),
      sellerActor(user.id),
    );

    const result = await profileService.getProfileById(created.id);

    expect(result).toMatchObject({
      id: created.id,
      userId: user.id,
      displayName: created.displayName,
    });
  });
});

describe('when we get a profile by a missing id', () => {
  it('should reject with RESOURCE_NOT_FOUND', async () => {
    const missingId = new Types.ObjectId().toHexString();

    await expect(profileService.getProfileById(missingId)).rejects.toMatchObject(
      {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        details: { id: missingId },
      },
    );
  });
});
