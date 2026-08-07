import { IProfile } from '../entity/interfaces/profile.interface';

export interface IProfileRepositoryWrite {
  createProfile(profile: IProfile): Promise<IProfile>;
  updateProfileById(
    id: string,
    data: Partial<IProfile>,
  ): Promise<IProfile | null>;
  deleteProfileById(id: string): Promise<IProfile | null>;
}
