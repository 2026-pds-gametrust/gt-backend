import { UserRepositoryRead } from '../../../../../infraestructure/repository/identity/user.repository.read';
import { UserModel } from '../../../../../infraestructure/db/mongo/models/user.model';
import { validUserMock } from '../../../../__mocks__/user.mock';

const repositoryRead = new UserRepositoryRead();

describe('when we list users via repository', () => {
  it('should return users matching the provided filter', async () => {
    const userData = validUserMock({ fullName: 'Filtered User' });
    await UserModel.create(userData);

    const users = await repositoryRead.listUsers({ fullName: 'Filtered User' });

    expect(users.length).toBeGreaterThanOrEqual(1);
    expect(users.some((u) => u.email === userData.email)).toBe(true);
  });
});
