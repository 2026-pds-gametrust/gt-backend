import { IProfile } from '../entity/interfaces/profile.interface';

export interface IProfileNearQuery {
  lng: number;
  lat: number;
  maxDistanceMeters: number;
  limit: number;
}

export interface IProfileNearHit {
  profile: IProfile;
  distanceMeters: number;
}

export interface IProfileRepositoryRead {
  findProfileById(id: string): Promise<IProfile | null>;
  findProfileByUserId(userId: string): Promise<IProfile | null>;
  findProfilesByUserIds(userIds: string[]): Promise<IProfile[]>;
  listProfiles(filter?: Partial<IProfile>): Promise<IProfile[]>;
  findNear(query: IProfileNearQuery): Promise<IProfileNearHit[]>;
}
