import { Types } from 'mongoose';
import { ProfileModel } from '../../../../../infraestructure/db/mongo/models/profile.model';
import { ProfileRepositoryRead } from '../../../../../infraestructure/repository/identity/profile.repository.read';
import { validProfileMock } from '../../../../__mocks__/profile.mock';

const repositoryRead = new ProfileRepositoryRead();

describe('when we find a profile by id via repository', () => {
  it('should return the profile when it exists', async () => {
    const profileData = validProfileMock();
    await ProfileModel.create(profileData);

    const found = await repositoryRead.findProfileById(profileData.id);

    expect(found).toMatchObject({
      id: profileData.id,
      userId: profileData.userId,
      displayName: profileData.displayName,
    });
  });

  it('should return null when the profile does not exist', async () => {
    const found = await repositoryRead.findProfileById(
      new Types.ObjectId().toHexString(),
    );
    expect(found).toBeNull();
  });
});
