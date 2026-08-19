import { IAccessTokenRevocationChecker } from '../../domain/identity/ports/access-token-revocation-checker.interface';
import { IRefreshSessionRepositoryRead } from '../../domain/identity/repository/refresh-session.repository.read';

export class AccessTokenRevocationChecker
  implements IAccessTokenRevocationChecker
{
  constructor(
    private readonly refreshSessionRepositoryRead: IRefreshSessionRepositoryRead,
  ) {}

  async isAccessInvalidated(sessionId: string): Promise<boolean> {
    const sid = sessionId?.trim();
    if (!sid) {
      return false;
    }
    const session =
      await this.refreshSessionRepositoryRead.findRefreshSessionById(sid);
    return session?.accessInvalidatedAt != null;
  }
}
