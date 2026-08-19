import { IUser } from '../entity/interfaces/user.interface';

export interface IUserRepositoryRead {
  findUserById(id: string): Promise<IUser | null>;
  findUserByEmail(email: string): Promise<IUser | null>;
  findUserByCpf(cpf: string): Promise<IUser | null>;
  listUsers(filter?: Partial<IUser>): Promise<IUser[]>;
  findUserIdsBySearchQuery(query: string, limit: number): Promise<string[]>;
  findUsersByIds(ids: string[]): Promise<IUser[]>;
}
