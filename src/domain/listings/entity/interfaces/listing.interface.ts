import { EListingCondition } from '../enums/EListingCondition';
import { EListingStatus } from '../enums/EListingStatus';
import { EShippingMode } from '../enums/EShippingMode';
import { EWarrantyType } from '../enums/EWarrantyType';

export type TListingAttributeValue = string | number | boolean;

export interface IListingMedia {
  photoUrls: string[];
  videoUrl?: string;
  coverPhotoUrl?: string;
}

export interface IListingShipping {
  modes: EShippingMode[];
  packageWeightGrams?: number;
  packageLengthCm?: number;
  packageWidthCm?: number;
  packageHeightCm?: number;
  freeShipping?: boolean;
}

export interface IListingWarranty {
  type: EWarrantyType;
  months?: number;
}

export interface IListing {
  id: string;
  sellerId: string;
  productId: string;
  title: string;
  description?: string;
  condition: EListingCondition;
  priceCents: number;
  listPriceCents?: number;
  currency: string;
  attributes?: Record<string, TListingAttributeValue>;
  media: IListingMedia;
  shipping: IListingShipping;
  locationApprox?: string;
  warranty?: IListingWarranty;
  acceptsOffers: boolean;
  buyNowEnabled: boolean;
  quantity: number;
  status: EListingStatus;
  qualityHints?: Record<string, unknown>;
  createdAt: Date;
  updatedAt?: Date;
}
