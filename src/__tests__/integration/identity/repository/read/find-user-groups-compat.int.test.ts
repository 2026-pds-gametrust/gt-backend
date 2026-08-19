import { Types } from 'mongoose';
import { UserModel } from '../../../../../infraestructure/db/mongo/models/user.model';
import { UserRepositoryRead } from '../../../../../infraestructure/repository/identity/user.repository.read';
import { validUserMock } from '../../../../__mocks__/user.mock';

const repositoryRead = new UserRepositoryRead();

describe('when reading a legacy user document without groups', () => {
  it('should map missing groups to an empty array', async () => {
    const user = validUserMock();
    await UserModel.collection.insertOne({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      cpf: user.cpf,
      birthDate: user.birthDate,
      verified: user.verified,
      phoneVerified: user.phoneVerified,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: new Date(),
    });

    const found = await repositoryRead.findUserById(user.id);
    expect(found).not.toBeNull();
    expect(found!.groups).toEqual([]);
  });
});

describe('when finding a missing user via repository', () => {
  it('should return null', async () => {
    const found = await repositoryRead.findUserById(
      new Types.ObjectId().toHexString(),
    );
    expect(found).toBeNull();
  });
});
