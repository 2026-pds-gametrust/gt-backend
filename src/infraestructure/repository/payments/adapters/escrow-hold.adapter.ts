import { IEscrowHold } from '../../../../domain/payments/entity/interfaces/escrow-hold.interface';
import { IMEscrowHold } from '../../../db/mongo/models/escrow-hold.model';

export function dbToInternal(doc: IMEscrowHold): IEscrowHold {
  return {
    id: doc.id,
    orderId: doc.orderId,
    paymentId: doc.paymentId,
    amountCents: doc.amountCents,
    currency: doc.currency,
    status: doc.status,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export function internalToDb(escrow: IEscrowHold): Partial<IMEscrowHold> {
  return {
    id: escrow.id,
    orderId: escrow.orderId,
    paymentId: escrow.paymentId,
    amountCents: escrow.amountCents,
    currency: escrow.currency,
    status: escrow.status,
    createdAt: escrow.createdAt,
    updatedAt: escrow.updatedAt,
  };
}
