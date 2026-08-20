import { Types, model } from 'mongoose';
import { IEscrowHold } from '../../../../domain/payments/entity/interfaces/escrow-hold.interface';
import { EscrowHoldSchema } from '../schema/escrow-hold.schema';

export interface IMEscrowHold extends Omit<IEscrowHold, '_id'> {
  _id: Types.ObjectId;
  updatedAt: Date;
}

export const EscrowHoldModel = model<IMEscrowHold>(
  'EscrowHold',
  EscrowHoldSchema,
);
