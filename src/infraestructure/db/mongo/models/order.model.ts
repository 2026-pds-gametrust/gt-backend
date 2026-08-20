import { Types, model } from 'mongoose';
import { IOrder } from '../../../../domain/orders/entity/interfaces/order.interface';
import { OrderSchema } from '../schema/order.schema';

export interface IMOrder extends Omit<IOrder, '_id'> {
  _id: Types.ObjectId;
  updatedAt: Date;
}

export const OrderModel = model<IMOrder>('Order', OrderSchema);
