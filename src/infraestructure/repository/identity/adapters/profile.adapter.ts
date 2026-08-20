import { IProfile } from '../../../../domain/identity/entity/interfaces/profile.interface';
import { IMProfile } from '../../../db/mongo/models/profile.model';

export function dbToInternal(profile: IMProfile): IProfile {
  return {
    id: profile.id,
    userId: profile.userId,
    displayName: profile.displayName,
    bio: profile.bio,
    locationApprox: profile.locationApprox,
    addresses: (profile.addresses ?? []).map((address) => ({
      id: address.id,
      label: address.label,
      recipientName: address.recipientName,
      postalCode: address.postalCode,
      street: address.street,
      number: address.number,
      complement: address.complement,
      district: address.district,
      city: address.city,
      state: address.state,
      country: address.country,
      isBilling: address.isBilling,
      isShipping: address.isShipping,
      geo: address.geo
        ? {
            type: 'Point' as const,
            coordinates: [
              Number(address.geo.coordinates[0]),
              Number(address.geo.coordinates[1]),
            ] as [number, number],
          }
        : undefined,
      geoSource: address.geoSource,
    })),
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
    addresses: (profile.addresses ?? []).map((address) => ({
      id: address.id,
      label: address.label,
      recipientName: address.recipientName,
      postalCode: address.postalCode,
      street: address.street,
      number: address.number,
      complement: address.complement,
      district: address.district,
      city: address.city,
      state: address.state,
      country: address.country,
      isBilling: address.isBilling,
      isShipping: address.isShipping,
      geo: address.geo,
      geoSource: address.geoSource,
    })),
    defaultShippingAddressId: profile.defaultShippingAddressId,
    setupItems: profile.setupItems,
  };
}
