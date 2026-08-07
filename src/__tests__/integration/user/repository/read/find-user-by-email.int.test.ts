import { UserRepositoryRead } from '../../../../../infraestructure/repository/identity/user.repository.read';
import { UserModel } from '../../../../../infraestructure/db/mongo/models/user.model';
import { validUserMock } from '../../../../__mocks__/user.mock';

const repositoryRead = new UserRepositoryRead();

describe('when we find a user by email via repository', () => {
  it('should return the user when the email exists', async () => {
    const userData = validUserMock();
    await UserModel.create(userData);

    const found = await repositoryRead.findUserByEmail(userData.email);

    expect(found).toMatchObject({
      email: userData.email,
      fullName: userData.fullName,
    });
  });

  it('should return null when the email does not exist', async () => {
    const found = await repositoryRead.findUserByEmail(
      'nonexistent@example.com',
    );
    expect(found).toBeNull();
  });
});
