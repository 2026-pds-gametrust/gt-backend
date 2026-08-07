import { IProfile } from '../entity/interfaces/profile.interface';

export interface IProfileRepositoryRead {
  findProfileById(id: string): Promise<IProfile | null>;
  findProfileByUserId(userId: string): Promise<IProfile | null>;
  listProfiles(filter?: Partial<IProfile>): Promise<IProfile[]>;
}
