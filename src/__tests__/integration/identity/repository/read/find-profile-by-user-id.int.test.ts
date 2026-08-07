import { Types } from 'mongoose';
import { ProfileModel } from '../../../../../infraestructure/db/mongo/models/profile.model';
import { ProfileRepositoryRead } from '../../../../../infraestructure/repository/identity/profile.repository.read';
import { validProfileMock } from '../../../../__mocks__/profile.mock';

const repositoryRead = new ProfileRepositoryRead();

describe('when we find a profile by user id via repository', () => {
  it('should return the profile when it exists', async () => {
    const profileData = validProfileMock();
    await ProfileModel.create(profileData);

    const found = await repositoryRead.findProfileByUserId(profileData.userId);

    expect(found).toMatchObject({
      id: profileData.id,
      userId: profileData.userId,
      displayName: profileData.displayName,
    });
  });

  it('should return null when no profile exists for the user', async () => {
    const found = await repositoryRead.findProfileByUserId(
      new Types.ObjectId().toHexString(),
    );
    expect(found).toBeNull();
  });
});
