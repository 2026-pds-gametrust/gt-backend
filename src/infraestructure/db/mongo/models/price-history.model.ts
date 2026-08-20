import { Types, model } from 'mongoose';
import { IPriceHistory } from '../../../../domain/catalog/entity/interfaces/price-history.interface';
import { PriceHistorySchema } from '../schema/price-history.schema';

export interface IMPriceHistory extends Omit<IPriceHistory, '_id'> {
  _id: Types.ObjectId;
}

export const PriceHistoryModel = model<IMPriceHistory>(
  'PriceHistory',
  PriceHistorySchema,
);
