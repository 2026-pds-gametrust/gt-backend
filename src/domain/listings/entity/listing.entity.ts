import { createMoney } from '../../common/types/money';
import { EListingStatus } from './enums/EListingStatus';
import { EShippingMode } from './enums/EShippingMode';
import { EWarrantyType } from './enums/EWarrantyType';
import {
  IListing,
  IListingMedia,
  IListingShipping,
  IListingWarranty,
} from './interfaces/listing.interface';

export class ListingServiceEntity implements IListing {
  id: string;
  sellerId: string;
  productId: string;
  title: string;
  description?: string;
  condition: IListing['condition'];
  priceCents: number;
  listPriceCents?: number;
  currency: string;
  attributes?: IListing['attributes'];
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

  constructor(listing: IListing) {
    this.validate(listing);
    const money = createMoney(listing.priceCents, listing.currency);
    this.id = listing.id;
    this.sellerId = listing.sellerId;
    this.productId = listing.productId;
    this.title = listing.title.trim();
    this.description = listing.description?.trim();
    this.condition = listing.condition;
    this.priceCents = money.amountCents;
    this.listPriceCents = listing.listPriceCents;
    this.currency = money.currency;
    this.attributes = listing.attributes;
    this.media = {
      photoUrls: listing.media.photoUrls ?? [],
      videoUrl: listing.media.videoUrl?.trim(),
      coverPhotoUrl:
        listing.media.coverPhotoUrl?.trim() ||
        listing.media.photoUrls?.[0],
    };
    this.shipping = {
      ...listing.shipping,
      modes: [...(listing.shipping.modes ?? [])],
    };
    this.locationApprox = listing.locationApprox?.trim();
    this.warranty = listing.warranty
      ? {
          type: listing.warranty.type,
          months: listing.warranty.months,
        }
      : undefined;
    this.acceptsOffers = listing.acceptsOffers ?? false;
    this.buyNowEnabled = listing.buyNowEnabled ?? true;
    this.quantity = 1;
    this.status = listing.status ?? EListingStatus.DRAFT;
    this.qualityHints = listing.qualityHints;
    this.createdAt = listing.createdAt || new Date();
    this.updatedAt = listing.updatedAt;
  }

  private validate(listing: IListing): void {
    if (!listing.id?.trim()) {
      throw new Error('id is required');
    }
    if (!listing.sellerId?.trim()) {
      throw new Error('sellerId is required');
    }
    if (!listing.productId?.trim()) {
      throw new Error('productId is required');
    }
    if (!listing.title?.trim()) {
      throw new Error('title is required');
    }
    if (listing.quantity !== undefined && listing.quantity !== 1) {
      throw new Error('quantity must be 1');
    }
    createMoney(listing.priceCents, listing.currency || 'BRL');
    if (listing.listPriceCents !== undefined) {
      if (
        !Number.isInteger(listing.listPriceCents) ||
        listing.listPriceCents < listing.priceCents
      ) {
        throw new Error('listPriceCents must be an integer >= priceCents');
      }
    }
    if (!listing.media) {
      throw new Error('media is required');
    }
    if (!listing.shipping?.modes?.length) {
      throw new Error('shipping.modes is required and must be non-empty');
    }
    if (listing.warranty?.type && listing.warranty.type !== EWarrantyType.NONE) {
      if (
        listing.warranty.months !== undefined &&
        (!Number.isInteger(listing.warranty.months) ||
          listing.warranty.months < 1)
      ) {
        throw new Error('warranty.months must be an integer >= 1');
      }
    }
    if (listing.shipping.modes.includes(EShippingMode.SHIPPING)) {
      // dims/weight validated on publish in Service
    }
  }
}
