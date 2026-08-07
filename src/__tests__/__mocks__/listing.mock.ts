import { Types } from 'mongoose';
import { EListingCondition } from '../../domain/listings/entity/enums/EListingCondition';
import { EListingStatus } from '../../domain/listings/entity/enums/EListingStatus';
import { EShippingMode } from '../../domain/listings/entity/enums/EShippingMode';
import { IListing } from '../../domain/listings/entity/interfaces/listing.interface';

export const validListingMock = (override?: Partial<IListing>): IListing => ({
  id: new Types.ObjectId().toHexString(),
  sellerId: new Types.ObjectId().toHexString(),
  productId: new Types.ObjectId().toHexString(),
  title: `Used GPU ${Date.now()}`,
  condition: EListingCondition.GOOD,
  priceCents: 350000,
  currency: 'BRL',
  media: {
    photoUrls: ['https://cdn.example.com/photo1.jpg'],
  },
  shipping: {
    modes: [EShippingMode.PICKUP],
  },
  acceptsOffers: false,
  buyNowEnabled: true,
  quantity: 1,
  status: EListingStatus.DRAFT,
  createdAt: new Date(),
  ...override,
});
