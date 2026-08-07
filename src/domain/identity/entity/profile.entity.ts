import { IAddress } from './interfaces/address.interface';
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
    if (!profile.userId?.trim()) {
      throw new Error('userId is required');
    }
    for (const address of profile.addresses ?? []) {
      this.validateAddress(address);
    }
  }

  private normalizeAddress(address: IAddress): IAddress {
    return {
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
  }

  private validateAddress(address: IAddress): void {
    if (!address.id?.trim()) {
      throw new Error('address id is required');
    }
    if (!address.recipientName?.trim()) {
      throw new Error('recipientName is required');
    }
    const cep = address.postalCode?.replace(/\D/g, '') ?? '';
    if (!/^\d{8}$/.test(cep)) {
      throw new Error('postalCode must be 8 digits');
    }
    if (!address.street?.trim()) {
      throw new Error('street is required');
    }
    if (!address.number?.trim()) {
      throw new Error('number is required');
    }
    if (!address.district?.trim()) {
      throw new Error('district is required');
    }
    if (!address.city?.trim()) {
      throw new Error('city is required');
    }
    if (!address.state?.trim() || address.state.trim().length !== 2) {
      throw new Error('state must be 2 letters');
    }
  }
}
