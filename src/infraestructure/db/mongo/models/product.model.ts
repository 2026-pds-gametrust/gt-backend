import { Types, model } from 'mongoose';
import { IProduct } from '../../../../domain/catalog/entity/interfaces/product.interface';
import { ProductSchema } from '../schema/product.schema';

export interface IMProduct extends Omit<IProduct, '_id'> {
  _id: Types.ObjectId;
  updatedAt: Date;
}

export const ProductModel = model<IMProduct>('Product', ProductSchema);
