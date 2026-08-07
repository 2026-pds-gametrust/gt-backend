import { UserRepositoryWrite } from '../../../../../infraestructure/repository/identity/user.repository.write';
import { UserModel } from '../../../../../infraestructure/db/mongo/models/user.model';
import { validUserMock } from '../../../../__mocks__/user.mock';

const repositoryWrite = new UserRepositoryWrite();

describe('when we update a user by id via repository', () => {
  it('should return the updated user', async () => {
    const userData = validUserMock();
    await UserModel.create(userData);

    const updated = await repositoryWrite.updateUserById(userData.id, {
      fullName: 'Updated Name',
    });

    expect(updated?.fullName).toBe('Updated Name');
    expect(updated?.email).toBe(userData.email);
  });

  it('should return null when the user does not exist', async () => {
    const updated = await repositoryWrite.updateUserById('nonexistent', {
      fullName: 'Updated',
    });
    expect(updated).toBeNull();
  });
});
