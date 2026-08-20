import { ProfileServiceFactory } from '../../../../configuration/factory/profile.service.factory';
import { UserServiceFactory } from '../../../../configuration/factory/user.service.factory';
import { sellerActor } from '../../../__mocks__/actor.mock';
import { validProfileMock } from '../../../__mocks__/profile.mock';
import { validUserMock } from '../../../__mocks__/user.mock';

const userService = UserServiceFactory.create();
const profileService = ProfileServiceFactory.create();

describe('when we list profiles with a filter', () => {
  it('should return profiles matching the filter', async () => {
    const user = await userService.createUser(validUserMock());
    const created = await profileService.createProfile(
      validProfileMock({
        userId: user.id,
        displayName: `ListFilter-${user.id}`,
      }),
      sellerActor(user.id),
    );

    const profiles = await profileService.listProfiles({
      displayName: created.displayName,
    });

    expect(profiles.length).toBeGreaterThanOrEqual(1);
    expect(profiles.some((p) => p.id === created.id)).toBe(true);
  });
});

describe('when we list profiles with an empty filter', () => {
  it('should include a recently created profile', async () => {
    const user = await userService.createUser(validUserMock());
    const created = await profileService.createProfile(
      validProfileMock({ userId: user.id }),
      sellerActor(user.id),
    );

    const profiles = await profileService.listProfiles();

    expect(profiles.some((p) => p.id === created.id)).toBe(true);
  });
});
