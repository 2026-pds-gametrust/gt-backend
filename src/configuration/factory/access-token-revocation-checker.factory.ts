import { AccessTokenRevocationChecker } from '../../infraestructure/auth/access-token-revocation.checker';
import { RefreshSessionRepositoryRead } from '../../infraestructure/repository/identity/refresh-session.repository.read';

export class AccessTokenRevocationCheckerFactory {
  static create() {
    return new AccessTokenRevocationChecker(new RefreshSessionRepositoryRead());
  }
}
