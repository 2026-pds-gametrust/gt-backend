import { Types, model } from 'mongoose';
import { ITrustEvent } from '../../../../domain/trust/entity/interfaces/trust-event.interface';
import { TrustEventSchema } from '../schema/trust-event.schema';

export interface IMTrustEvent extends Omit<ITrustEvent, '_id'> {
  _id: Types.ObjectId;
}

export const TrustEventModel = model<IMTrustEvent>(
  'TrustEvent',
  TrustEventSchema,
);
