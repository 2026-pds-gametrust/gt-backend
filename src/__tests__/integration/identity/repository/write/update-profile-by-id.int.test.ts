import { Types } from 'mongoose';
import { ProfileModel } from '../../../../../infraestructure/db/mongo/models/profile.model';
import { ProfileRepositoryWrite } from '../../../../../infraestructure/repository/identity/profile.repository.write';
import { validProfileMock } from '../../../../__mocks__/profile.mock';

const repositoryWrite = new ProfileRepositoryWrite();

describe('when we update a profile by id via repository', () => {
  it('should return the updated profile', async () => {
    const profileData = validProfileMock();
    await ProfileModel.create(profileData);

    const updated = await repositoryWrite.updateProfileById(profileData.id, {
      displayName: 'Updated Repo Name',
      bio: 'Updated bio',
    });

    expect(updated).toMatchObject({
      id: profileData.id,
      displayName: 'Updated Repo Name',
      bio: 'Updated bio',
      userId: profileData.userId,
    });
  });

  it('should return null when the profile does not exist', async () => {
    const updated = await repositoryWrite.updateProfileById(
      new Types.ObjectId().toHexString(),
      { displayName: 'Missing' },
    );
    expect(updated).toBeNull();
  });
});
