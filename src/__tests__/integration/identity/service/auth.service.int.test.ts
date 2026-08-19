import { Types } from 'mongoose';
import { AuthServiceFactory } from '../../../../configuration/factory/auth.service.factory';
import { CredentialModel } from '../../../../infraestructure/db/mongo/models/credential.model';
import { RefreshSessionModel } from '../../../../infraestructure/db/mongo/models/refresh-session.model';
import { UserModel } from '../../../../infraestructure/db/mongo/models/user.model';
import { Sha256RefreshTokenHasher } from '../../../../infraestructure/crypto/sha256-refresh-token-hasher';
import { validUserMock } from '../../../__mocks__/user.mock';
import { assertNoSecretFields } from '../../../helpers/auth-assertions';

const authService = AuthServiceFactory.create();
const PASSWORD = 'correct-horse-battery';

describe('when registering through AuthServiceFactory', () => {
  it('should store password and refresh hashes that are not the plaintext', async () => {
    const user = validUserMock();
    const session = await authService.register({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      cpf: user.cpf,
      birthDate: user.birthDate,
      password: PASSWORD,
    });

    const credential = await CredentialModel.findOne({ userId: user.id });
    expect(credential).toBeDefined();
    expect(credential!.passwordHash).not.toBe(PASSWORD);
    expect(credential!.passwordHash.startsWith('$2')).toBe(true);

    const hasher = new Sha256RefreshTokenHasher();
    const refreshDoc = await RefreshSessionModel.findOne({
      tokenHash: hasher.hash(session.refreshToken),
    });
    expect(refreshDoc).toBeDefined();
    expect(refreshDoc!.tokenHash).not.toBe(session.refreshToken);

    assertNoSecretFields(session.user);
    const httpUser = await UserModel.findOne({ id: user.id }).lean();
    expect(JSON.stringify(httpUser)).not.toMatch(/"password"\s*:/);
  });
});
