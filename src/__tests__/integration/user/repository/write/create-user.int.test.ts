import { UserRepositoryWrite } from '../../../../../infraestructure/repository/identity/user.repository.write';
import { validUserMock } from '../../../../__mocks__/user.mock';

const repositoryWrite = new UserRepositoryWrite();

describe('when we create a user via repository', () => {
  it('should return the created user as a domain object', async () => {
    const user = validUserMock();

    const created = await repositoryWrite.createUser(user);

    expect(created).toMatchObject({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
    });
    expect(created.createdAt).toBeDefined();
  });
});
