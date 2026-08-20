export interface IAccessTokenRevocationChecker {
  isAccessInvalidated(sessionId: string): Promise<boolean>;
}
