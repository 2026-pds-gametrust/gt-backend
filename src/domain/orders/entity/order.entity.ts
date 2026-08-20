import { IThrowedError } from '@sauvvitech/st-packages';
import { EShippingMode } from '../../listings/entity/enums/EShippingMode';
import { EErrorCode } from '../../common/errors/enums/EErrorCode';
import { EOrderStatus } from './enums/EOrderStatus';
import { IOrder } from './interfaces/order.interface';

export class OrderServiceEntity implements IOrder {
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

  constructor(order: IOrder) {
    this.validateOrder(order);
    this.id = order.id;
    this.listingId = order.listingId;
    this.buyerId = order.buyerId;
    this.sellerId = order.sellerId;
    this.shippingMode = order.shippingMode;
    this.priceCents = order.priceCents;
    this.currency = order.currency;
    this.status = order.status;
    this.reservationExpiresAt = order.reservationExpiresAt;
    this.createdAt = order.createdAt;
    this.updatedAt = order.updatedAt;
  }

  private validateOrder(order: IOrder): void {
    if (!order.id?.trim()) {
      throw new Error('id is required');
    }
    if (!order.listingId?.trim()) {
      throw new Error('listingId is required');
    }
    if (!order.buyerId?.trim()) {
      throw new Error('buyerId is required');
    }
    if (!order.sellerId?.trim()) {
      throw new Error('sellerId is required');
    }
    if (order.buyerId === order.sellerId) {
      throw {
        status: 403,
        errorCode: EErrorCode.FIELD_INVALID,
        message: 'Buyer cannot purchase own listing',
      } as IThrowedError;
    }
    if (!Object.values(EShippingMode).includes(order.shippingMode)) {
      throw new Error('shippingMode is invalid');
    }
    if (!Number.isInteger(order.priceCents) || order.priceCents <= 0) {
      throw new Error('priceCents must be a positive integer');
    }
    if (!order.currency?.trim()) {
      throw new Error('currency is required');
    }
    if (!Object.values(EOrderStatus).includes(order.status)) {
      throw new Error('status is invalid');
    }
  }
}
