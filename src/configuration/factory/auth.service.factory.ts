import { AuthService } from '../../domain/identity/service/auth.service';
import { CredentialRepositoryRead } from '../../infraestructure/repository/identity/credential.repository.read';
import { CredentialRepositoryWrite } from '../../infraestructure/repository/identity/credential.repository.write';
import { RefreshSessionRepositoryRead } from '../../infraestructure/repository/identity/refresh-session.repository.read';
import { RefreshSessionRepositoryWrite } from '../../infraestructure/repository/identity/refresh-session.repository.write';
import { UserRepositoryRead } from '../../infraestructure/repository/identity/user.repository.read';
import { UserRepositoryWrite } from '../../infraestructure/repository/identity/user.repository.write';
import { GT_REFRESH_TTL_SECONDS } from '../env-constants/auth.env';
import { PasswordHasherFactory } from './password-hasher.factory';
import { ProfileServiceFactory } from './profile.service.factory';
import { RefreshTokenHasherFactory } from './refresh-token-hasher.factory';
import { TokenSignerFactory } from './token-signer.factory';
import { UserServiceFactory } from './user.service.factory';

export class AuthServiceFactory {
  static create() {
    return new AuthService({
      userService: UserServiceFactory.create(),
      profileService: ProfileServiceFactory.create(),
      userRepositoryRead: new UserRepositoryRead(),
      userRepositoryWrite: new UserRepositoryWrite(),
      credentialRepositoryRead: new CredentialRepositoryRead(),
      credentialRepositoryWrite: new CredentialRepositoryWrite(),
      refreshSessionRepositoryRead: new RefreshSessionRepositoryRead(),
      refreshSessionRepositoryWrite: new RefreshSessionRepositoryWrite(),
      passwordHasher: PasswordHasherFactory.create(),
      tokenSigner: TokenSignerFactory.create(),
      refreshTokenHasher: RefreshTokenHasherFactory.create(),
      refreshTtlSeconds: GT_REFRESH_TTL_SECONDS,
    });
  }
}
