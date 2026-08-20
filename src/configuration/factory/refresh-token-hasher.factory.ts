import { Sha256RefreshTokenHasher } from '../../infraestructure/crypto/sha256-refresh-token-hasher';

export class RefreshTokenHasherFactory {
  static create() {
    return new Sha256RefreshTokenHasher();
  }
}
