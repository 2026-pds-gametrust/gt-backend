import { EPaymentStatus } from '../enums/EPaymentStatus';

export interface IPayment {
  id: string;
  orderId: string;
  amountCents: number;
  currency: string;
  status: EPaymentStatus;
  createdAt: Date;
  updatedAt?: Date;
}
