import { IEventPublisher } from '../../common/messaging/event-publisher.interface';
import { IActorContext } from '../../common/types/actor-context';
import { IAddress } from '../entity/interfaces/address.interface';
import { IProfile, ISetupItem } from '../entity/interfaces/profile.interface';
import { ICepLookup } from '../ports/cep-lookup.interface';
import { IGeocoder } from '../ports/geocoder.interface';
import { IProfileRepositoryRead } from '../repository/profile.repository.read';
import { IProfileRepositoryWrite } from '../repository/profile.repository.write';
import { IUserRepositoryRead } from '../repository/user.repository.read';

export interface IParamsCreateProfile {
  id: string;
  userId: string;
  displayName?: string;
  bio?: string;
  locationApprox?: string;
  addresses?: IAddress[];
  defaultShippingAddressId?: string;
  setupItems?: ISetupItem[];
  /** When true (register), empty addresses are allowed. */
  allowEmptyAddresses?: boolean;
}

export interface IParamsUpdateProfile {
  profileData: Partial<
    Pick<
      IProfile,
      | 'displayName'
      | 'bio'
      | 'locationApprox'
      | 'addresses'
      | 'defaultShippingAddressId'
      | 'setupItems'
    >
  >;
}

export interface IParamsFindProfilesNear {
  lng: number;
  lat: number;
  radiusMeters?: number;
  limit?: number;
}

export interface IProfileNearPublic {
  id: string;
  userId: string;
  displayName?: string;
  bio?: string;
  locationApprox?: string;
  createdAt: Date;
  updatedAt?: Date;
  distanceMeters: number;
}

export interface IParamsProfileService {
  profileRepositoryRead: IProfileRepositoryRead;
  profileRepositoryWrite: IProfileRepositoryWrite;
  userRepositoryRead: IUserRepositoryRead;
  eventPublisher: IEventPublisher;
  cepLookup: ICepLookup;
  geocoder: IGeocoder;
}

export interface IProfileService {
  createProfile(
    params: IParamsCreateProfile,
    actor: IActorContext,
  ): Promise<IProfile>;
  getProfileById(id: string, actor?: IActorContext): Promise<IProfile>;
  getProfileByUserId(userId: string, actor?: IActorContext): Promise<IProfile>;
  updateProfileById(
    id: string,
    params: IParamsUpdateProfile,
    actor: IActorContext,
  ): Promise<IProfile>;
  updateProfileByUserId(
    userId: string,
    params: IParamsUpdateProfile,
    actor: IActorContext,
  ): Promise<IProfile>;
  listProfiles(filter?: Partial<IProfile>): Promise<IProfile[]>;
  findProfilesNear(
    params: IParamsFindProfilesNear,
  ): Promise<IProfileNearPublic[]>;
  getMyProfile(actor: IActorContext): Promise<IProfile>;
}
