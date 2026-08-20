import { JwtAccessTokenSigner } from '../../infraestructure/crypto/jwt-access-token-signer';
import {
  assertJwtAccessSecretConfigured,
  GT_JWT_ACCESS_TTL_SECONDS,
} from '../env-constants/auth.env';

export class TokenSignerFactory {
  static create() {
    return new JwtAccessTokenSigner(
      assertJwtAccessSecretConfigured(),
      GT_JWT_ACCESS_TTL_SECONDS,
    );
  }
}
