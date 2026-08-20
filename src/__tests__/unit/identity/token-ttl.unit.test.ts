import jwt from 'jsonwebtoken';
import {
  GT_JWT_ACCESS_TTL_SECONDS,
  GT_REFRESH_TTL_SECONDS,
} from '../../../configuration/env-constants/auth.env';
import { JwtAccessTokenSigner } from '../../../infraestructure/crypto/jwt-access-token-signer';
import { Sha256RefreshTokenHasher } from '../../../infraestructure/crypto/sha256-refresh-token-hasher';

describe('when using default access and refresh TTLs', () => {
  it('should keep access TTL at 900s and shorter than refresh TTL', () => {
    expect(GT_JWT_ACCESS_TTL_SECONDS).toBe(900);
    expect(GT_REFRESH_TTL_SECONDS).toBe(2_592_000);
    expect(GT_JWT_ACCESS_TTL_SECONDS).toBeLessThan(GT_REFRESH_TTL_SECONDS);
  });
});

describe('when signing an access token with the default TTL', () => {
  it('should set exp about 900 seconds after iat', () => {
    const signer = new JwtAccessTokenSigner('gt-test-jwt-access-secret-min-32-chars', 900);
    const now = Math.floor(Date.now() / 1000);
    const token = signer.signAccessToken({
      sub: 'user-1',
      groups: ['app-user'],
      sid: 'sid-1',
      fid: 'fid-1',
      typ: 'access',
    });
    const payload = jwt.decode(token) as jwt.JwtPayload;

    expect(payload.iat).toBeGreaterThanOrEqual(now - 2);
    expect(payload.exp).toBe(payload.iat! + 900);
  });
});

describe('when creating a refresh session expiry from the default TTL', () => {
  it('should expire about 30 days from now', () => {
    const hasher = new Sha256RefreshTokenHasher();
    const generated = hasher.generate();
    const expiresAt = new Date(Date.now() + GT_REFRESH_TTL_SECONDS * 1000);
    const delta = expiresAt.getTime() - Date.now();

    expect(generated.plaintext).not.toBe(generated.tokenHash);
    expect(hasher.hash(generated.plaintext)).toBe(generated.tokenHash);
    expect(delta).toBeGreaterThan(2_591_000 * 1000);
    expect(delta).toBeLessThanOrEqual(2_592_000 * 1000 + 50);
  });
});
