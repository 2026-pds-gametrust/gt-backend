import { EEscrowHoldStatus } from '../enums/EEscrowHoldStatus';

export interface IEscrowHold {
  id: string;
  orderId: string;
  paymentId: string;
  amountCents: number;
  currency: string;
  status: EEscrowHoldStatus;
  createdAt: Date;
  updatedAt?: Date;
}
