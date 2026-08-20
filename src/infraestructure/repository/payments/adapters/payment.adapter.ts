import { IPayment } from '../../../../domain/payments/entity/interfaces/payment.interface';
import { IMPayment } from '../../../db/mongo/models/payment.model';

export function dbToInternal(doc: IMPayment): IPayment {
  return {
    id: doc.id,
    orderId: doc.orderId,
    amountCents: doc.amountCents,
    currency: doc.currency,
    status: doc.status,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export function internalToDb(payment: IPayment): Partial<IMPayment> {
  return {
    id: payment.id,
    orderId: payment.orderId,
    amountCents: payment.amountCents,
    currency: payment.currency,
    status: payment.status,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
  };
}
