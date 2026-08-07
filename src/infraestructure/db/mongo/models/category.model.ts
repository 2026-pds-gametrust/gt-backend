import { Types, model } from 'mongoose';
import { ICategory } from '../../../../domain/catalog/entity/interfaces/category.interface';
import { CategorySchema } from '../schema/category.schema';

export interface IMCategory extends Omit<ICategory, '_id'> {
  _id: Types.ObjectId;
  updatedAt: Date;
}

export const CategoryModel = model<IMCategory>('Category', CategorySchema);
