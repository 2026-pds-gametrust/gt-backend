import { IAddress } from './address.interface';

export interface ISetupItem {
  [key: string]: unknown;
}

export interface IProfile {
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
}
