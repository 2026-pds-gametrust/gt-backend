import { ProfileRepositoryWrite } from '../../../../../infraestructure/repository/identity/profile.repository.write';
import { validProfileMock } from '../../../../__mocks__/profile.mock';

const repositoryWrite = new ProfileRepositoryWrite();

describe('when we create a profile via repository', () => {
  it('should return the created profile as a domain object', async () => {
    const profile = validProfileMock();

    const created = await repositoryWrite.createProfile(profile);

    expect(created).toMatchObject({
      id: profile.id,
      userId: profile.userId,
      displayName: profile.displayName,
    });
    expect(created.createdAt).toBeDefined();
  });
});
