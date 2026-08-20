import { Types } from 'mongoose';
import { EErrorCode } from '../../../../../domain/common/errors/enums/EErrorCode';
import { RefreshSessionModel } from '../../../../../infraestructure/db/mongo/models/refresh-session.model';
import { RefreshSessionRepositoryRead } from '../../../../../infraestructure/repository/identity/refresh-session.repository.read';
import { RefreshSessionRepositoryWrite } from '../../../../../infraestructure/repository/identity/refresh-session.repository.write';

const repositoryRead = new RefreshSessionRepositoryRead();
const repositoryWrite = new RefreshSessionRepositoryWrite();

function session(override?: Record<string, unknown>) {
  return {
    id: new Types.ObjectId().toHexString(),
    familyId: new Types.ObjectId().toHexString(),
    userId: new Types.ObjectId().toHexString(),
    tokenHash: `hash-${new Types.ObjectId().toHexString()}`,
    expiresAt: new Date(Date.now() + 60_000),
    createdAt: new Date(),
    ...override,
  };
}

describe('when finding a refresh session by token hash', () => {
  it('should return the session when it exists', async () => {
    const created = session();
    await RefreshSessionModel.create(created);

    const found = await repositoryRead.findByTokenHash(created.tokenHash);
    expect(found).toMatchObject({
      id: created.id,
      tokenHash: created.tokenHash,
    });
  });
});

describe('when finding a missing refresh session', () => {
  it('should return null and not a product 401', async () => {
    const found = await repositoryRead.findByTokenHash('missing-hash');
    expect(found).toBeNull();
  });
});

describe('when creating two refresh sessions with the same tokenHash', () => {
  it('should reject with DATABASE_ERROR because tokenHash is unique', async () => {
    try {
      await RefreshSessionModel.collection.createIndex(
        { tokenHash: 1 },
        { unique: true },
      );
    } catch {
      // unique index may already exist from the schema
    }
    const tokenHash = `dup-${new Types.ObjectId().toHexString()}`;
    await repositoryWrite.createRefreshSession(session({ tokenHash }));

    await expect(
      repositoryWrite.createRefreshSession(session({ tokenHash })),
    ).rejects.toMatchObject({
      status: 500,
      errorCode: EErrorCode.DATABASE_ERROR,
    });
  });
});
