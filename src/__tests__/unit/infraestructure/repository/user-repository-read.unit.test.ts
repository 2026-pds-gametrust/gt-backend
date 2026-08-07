import { UserModel } from '../../../../infraestructure/db/mongo/models/user.model';
import { UserRepositoryRead } from '../../../../infraestructure/repository/identity/user.repository.read';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';

const repository = new UserRepositoryRead();

describe('when user repository read hits a database failure', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should throw DATABASE_ERROR on findUserById', async () => {
    jest.spyOn(UserModel, 'findOne').mockRejectedValueOnce(new Error('boom'));
    await expect(repository.findUserById('id')).rejects.toMatchObject({
      status: 500,
      errorCode: EErrorCode.DATABASE_ERROR,
    });
  });

  it('should throw DATABASE_ERROR on findUserByEmail', async () => {
    jest.spyOn(UserModel, 'findOne').mockRejectedValueOnce(new Error('boom'));
    await expect(
      repository.findUserByEmail('a@b.com'),
    ).rejects.toMatchObject({
      status: 500,
      errorCode: EErrorCode.DATABASE_ERROR,
    });
  });

  it('should throw DATABASE_ERROR on findUserByCpf', async () => {
    jest.spyOn(UserModel, 'findOne').mockRejectedValueOnce(new Error('boom'));
    await expect(repository.findUserByCpf('123')).rejects.toMatchObject({
      status: 500,
      errorCode: EErrorCode.DATABASE_ERROR,
    });
  });

  it('should throw DATABASE_ERROR on listUsers', async () => {
    jest.spyOn(UserModel, 'find').mockRejectedValueOnce(new Error('boom'));
    await expect(repository.listUsers()).rejects.toMatchObject({
      status: 500,
      errorCode: EErrorCode.DATABASE_ERROR,
    });
  });
});
