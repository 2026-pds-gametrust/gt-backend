import { IProfile } from '../../../../domain/identity/entity/interfaces/profile.interface';
import { IMProfile } from '../../../db/mongo/models/profile.model';

export function dbToInternal(profile: IMProfile): IProfile {
  return {
    id: profile.id,
    userId: profile.userId,
    displayName: profile.displayName,
    bio: profile.bio,
    locationApprox: profile.locationApprox,
    addresses: profile.addresses ?? [],
    defaultShippingAddressId: profile.defaultShippingAddressId,
    setupItems: profile.setupItems,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}

export function internalToDb(
  profile: IProfile,
): Omit<IMProfile, '_id' | 'createdAt' | 'updatedAt'> {
  return {
    id: profile.id,
    userId: profile.userId,
    displayName: profile.displayName,
    bio: profile.bio,
    locationApprox: profile.locationApprox,
    addresses: profile.addresses ?? [],
    defaultShippingAddressId: profile.defaultShippingAddressId,
    setupItems: profile.setupItems,
  };
}
