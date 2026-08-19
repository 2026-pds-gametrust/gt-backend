import { NODE_ENV } from './env.constants';

const TEST_JWT_ACCESS_SECRET = 'gt-test-jwt-access-secret-min-32-chars';

export const GT_JWT_ACCESS_SECRET =
  process.env.GT_JWT_ACCESS_SECRET ||
  (NODE_ENV === 'test' ? TEST_JWT_ACCESS_SECRET : '');

export const GT_JWT_ACCESS_TTL_SECONDS =
  Number(process.env.GT_JWT_ACCESS_TTL_SECONDS) || 900;

export const GT_REFRESH_TTL_SECONDS =
  Number(process.env.GT_REFRESH_TTL_SECONDS) || 2_592_000;

export const GT_BCRYPT_ROUNDS = Number(process.env.GT_BCRYPT_ROUNDS) || 12;

export function assertJwtAccessSecretConfigured(): string {
  const secret = GT_JWT_ACCESS_SECRET;
  if (!secret || (NODE_ENV !== 'test' && secret.length < 32)) {
    throw new Error('GT_JWT_ACCESS_SECRET must be set (min 32 chars)');
  }
  return secret;
}
