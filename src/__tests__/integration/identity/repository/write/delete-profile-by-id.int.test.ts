import { Types } from 'mongoose';
import { ProfileModel } from '../../../../../infraestructure/db/mongo/models/profile.model';
import { ProfileRepositoryWrite } from '../../../../../infraestructure/repository/identity/profile.repository.write';
import { validProfileMock } from '../../../../__mocks__/profile.mock';

const repositoryWrite = new ProfileRepositoryWrite();

describe('when we delete a profile by id via repository', () => {
  it('should return the deleted profile', async () => {
    const profileData = validProfileMock();
    await ProfileModel.create(profileData);

    const deleted = await repositoryWrite.deleteProfileById(profileData.id);

    expect(deleted?.id).toBe(profileData.id);
  });

  it('should not find the profile after deletion', async () => {
    const profileData = validProfileMock();
    await ProfileModel.create(profileData);

    await repositoryWrite.deleteProfileById(profileData.id);
    const found = await ProfileModel.findOne({ id: profileData.id });

    expect(found).toBeNull();
  });

  it('should return null when the profile does not exist', async () => {
    const deleted = await repositoryWrite.deleteProfileById(
      new Types.ObjectId().toHexString(),
    );
    expect(deleted).toBeNull();
  });
});
