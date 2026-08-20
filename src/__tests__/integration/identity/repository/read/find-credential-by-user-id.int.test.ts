import { Types } from 'mongoose';
import { EErrorCode } from '../../../../../domain/common/errors/enums/EErrorCode';
import { CredentialModel } from '../../../../../infraestructure/db/mongo/models/credential.model';
import { CredentialRepositoryRead } from '../../../../../infraestructure/repository/identity/credential.repository.read';
import { CredentialRepositoryWrite } from '../../../../../infraestructure/repository/identity/credential.repository.write';

const repositoryRead = new CredentialRepositoryRead();
const repositoryWrite = new CredentialRepositoryWrite();

describe('when finding a credential by userId', () => {
  it('should return the credential when it exists', async () => {
    const credential = {
      id: new Types.ObjectId().toHexString(),
      userId: new Types.ObjectId().toHexString(),
      passwordHash: 'hashed-secret',
      createdAt: new Date(),
    };
    await CredentialModel.create(credential);

    const found = await repositoryRead.findByUserId(credential.userId);
    expect(found).toMatchObject({
      id: credential.id,
      userId: credential.userId,
      passwordHash: 'hashed-secret',
    });
  });
});

describe('when finding a missing credential', () => {
  it('should return null and not a product 401', async () => {
    const found = await repositoryRead.findByUserId(
      new Types.ObjectId().toHexString(),
    );
    expect(found).toBeNull();
  });
});

describe('when creating a second credential for the same userId', () => {
  it('should reject with DATABASE_ERROR because userId is unique', async () => {
    await CredentialModel.init();
    const userId = new Types.ObjectId().toHexString();
    await repositoryWrite.createCredential({
      id: new Types.ObjectId().toHexString(),
      userId,
      passwordHash: 'hash-a',
      createdAt: new Date(),
    });

    await expect(
      repositoryWrite.createCredential({
        id: new Types.ObjectId().toHexString(),
        userId,
        passwordHash: 'hash-b',
        createdAt: new Date(),
      }),
    ).rejects.toMatchObject({
      status: 500,
      errorCode: EErrorCode.DATABASE_ERROR,
    });
  });
});
