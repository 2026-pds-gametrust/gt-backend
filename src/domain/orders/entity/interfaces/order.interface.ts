import { EShippingMode } from '../../../listings/entity/enums/EShippingMode';
import { EOrderStatus } from '../enums/EOrderStatus';

export interface IOrder {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  shippingMode: EShippingMode;
  priceCents: number;
  currency: string;
  status: EOrderStatus;
  reservationExpiresAt: Date;
  createdAt: Date;
  updatedAt?: Date;
}
