import bcrypt from 'bcrypt';
import { IPasswordHasher } from '../../domain/identity/ports/password-hasher.interface';

export class BcryptPasswordHasher implements IPasswordHasher {
  constructor(private readonly rounds: number) {}

  async hash(plainPassword: string): Promise<string> {
    return bcrypt.hash(plainPassword, this.rounds);
  }

  async verify(plainPassword: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, passwordHash);
  }
}
