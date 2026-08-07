import { ProfileModel } from '../../../../../infraestructure/db/mongo/models/profile.model';
import { ProfileRepositoryRead } from '../../../../../infraestructure/repository/identity/profile.repository.read';
import { validProfileMock } from '../../../../__mocks__/profile.mock';

const repositoryRead = new ProfileRepositoryRead();

describe('when we list profiles via repository', () => {
  it('should return profiles matching the provided filter', async () => {
    const profileData = validProfileMock({
      displayName: `RepoList-${Date.now()}`,
    });
    await ProfileModel.create(profileData);

    const profiles = await repositoryRead.listProfiles({
      displayName: profileData.displayName,
    });

    expect(profiles.length).toBeGreaterThanOrEqual(1);
    expect(profiles.some((p) => p.id === profileData.id)).toBe(true);
  });
});
