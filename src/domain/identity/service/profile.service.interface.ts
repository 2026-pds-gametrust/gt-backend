import { IEventPublisher } from '../../common/messaging/event-publisher.interface';
import { IActorContext } from '../../common/types/actor-context';
import { IAddress } from '../entity/interfaces/address.interface';
import { IProfile, ISetupItem } from '../entity/interfaces/profile.interface';
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

export interface IParamsProfileService {
  profileRepositoryRead: IProfileRepositoryRead;
  profileRepositoryWrite: IProfileRepositoryWrite;
  userRepositoryRead: IUserRepositoryRead;
  eventPublisher: IEventPublisher;
}

export interface IProfileService {
  createProfile(
    params: IParamsCreateProfile,
    actor: IActorContext,
  ): Promise<IProfile>;
  getProfileById(id: string): Promise<IProfile>;
  getProfileByUserId(userId: string): Promise<IProfile>;
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
}
