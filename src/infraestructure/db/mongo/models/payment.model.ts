import { Types, model } from 'mongoose';
import { IPayment } from '../../../../domain/payments/entity/interfaces/payment.interface';
import { PaymentSchema } from '../schema/payment.schema';

export interface IMPayment extends Omit<IPayment, '_id'> {
  _id: Types.ObjectId;
  updatedAt: Date;
}

export const PaymentModel = model<IMPayment>('Payment', PaymentSchema);
