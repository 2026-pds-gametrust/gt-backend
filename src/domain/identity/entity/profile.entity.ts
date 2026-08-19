import { requireNonEmptyString } from '../../common/types/required-string';
import { EGeoSource } from './enums/EGeoSource';
import { IAddress, IGeoPoint } from './interfaces/address.interface';
import { IProfile, ISetupItem } from './interfaces/profile.interface';

export class ProfileServiceEntity implements IProfile {
  id: string;
  userId: string;
  displayName?: string;
  bio?: string;
  locationApprox?: string;
  addresses: IAddress[];
  defaultShippingAddressId?: string;
  setupItems?: ISetupItem[];
  createdAt: Date;
  updatedAt?: Date;

  constructor(profile: IProfile) {
    this.validate(profile);
    this.id = profile.id;
    this.userId = profile.userId;
    this.displayName = profile.displayName?.trim();
    this.bio = profile.bio?.trim();
    this.locationApprox = profile.locationApprox?.trim();
    this.addresses = (profile.addresses ?? []).map((address) =>
      this.normalizeAddress(address),
    );
    this.defaultShippingAddressId = profile.defaultShippingAddressId;
    this.setupItems = profile.setupItems;
    this.createdAt = profile.createdAt || new Date();
    this.updatedAt = profile.updatedAt;

    if (
      this.defaultShippingAddressId &&
      !this.addresses.some((a) => a.id === this.defaultShippingAddressId)
    ) {
      throw new Error('defaultShippingAddressId must match an address id');
    }
  }

  private validate(profile: IProfile): void {
    requireNonEmptyString(profile.userId, 'userId');
    for (const address of profile.addresses ?? []) {
      this.validateAddress(address);
    }
  }

  private normalizeAddress(address: IAddress): IAddress {
    const normalized: IAddress = {
      id: address.id,
      label: address.label?.trim(),
      recipientName: address.recipientName.trim(),
      postalCode: address.postalCode.replace(/\D/g, ''),
      street: address.street.trim(),
      number: address.number.trim(),
      complement: address.complement?.trim(),
      district: address.district.trim(),
      city: address.city.trim(),
      state: address.state.trim().toUpperCase(),
      country: (address.country ?? 'BR').trim().toUpperCase() || 'BR',
      isBilling: address.isBilling ?? false,
      isShipping: address.isShipping ?? true,
    };
    const geo = this.normalizeGeo(address.geo);
    if (geo) {
      normalized.geo = geo;
    }
    if (
      address.geoSource === EGeoSource.BRASIL_API ||
      address.geoSource === EGeoSource.NOMINATIM
    ) {
      normalized.geoSource = address.geoSource;
    }
    return normalized;
  }

  private normalizeGeo(geo?: IGeoPoint): IGeoPoint | undefined {
    if (!geo || geo.type !== 'Point') {
      return undefined;
    }
    const lng = Number(geo.coordinates?.[0]);
    const lat = Number(geo.coordinates?.[1]);
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
      return undefined;
    }
    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      throw new Error('geo coordinates out of range');
    }
    return { type: 'Point', coordinates: [lng, lat] };
  }

  private validateAddress(address: IAddress): void {
    requireNonEmptyString(address.id, 'address id');
    requireNonEmptyString(address.recipientName, 'recipientName');
    const cep = address.postalCode?.replace(/\D/g, '') ?? '';
    if (!/^\d{8}$/.test(cep)) {
      throw new Error('postalCode must be 8 digits');
    }
    requireNonEmptyString(address.street, 'street');
    requireNonEmptyString(address.number, 'number');
    requireNonEmptyString(address.district, 'district');
    requireNonEmptyString(address.city, 'city');
    if (!address.state?.trim() || address.state.trim().length !== 2) {
      throw new Error('state must be 2 letters');
    }
  }
}
