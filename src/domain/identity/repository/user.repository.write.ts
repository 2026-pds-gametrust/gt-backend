import { IUser } from '../entity/interfaces/user.interface';

export interface IUserRepositoryWrite {
  createUser(user: IUser): Promise<IUser>;
  updateUserById(id: string, data: Partial<IUser>): Promise<IUser | null>;
  deleteUserById(id: string): Promise<IUser | null>;
}
