import { createHash, randomBytes } from 'crypto';
import {
  IGeneratedRefreshToken,
  IRefreshTokenHasher,
} from '../../domain/identity/ports/refresh-token-hasher.interface';

export class Sha256RefreshTokenHasher implements IRefreshTokenHasher {
  generate(): IGeneratedRefreshToken {
    const plaintext = randomBytes(32).toString('base64url');
    return {
      plaintext,
      tokenHash: this.hash(plaintext),
    };
  }

  hash(plaintext: string): string {
    return createHash('sha256').update(plaintext).digest('hex');
  }
}
