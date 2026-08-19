import { BcryptPasswordHasher } from '../../infraestructure/crypto/bcrypt-password-hasher';
import { GT_BCRYPT_ROUNDS } from '../env-constants/auth.env';

export class PasswordHasherFactory {
  static create() {
    return new BcryptPasswordHasher(GT_BCRYPT_ROUNDS);
  }
}
