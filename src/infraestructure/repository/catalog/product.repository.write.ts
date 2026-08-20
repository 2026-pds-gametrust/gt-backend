import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { IProduct } from '../../../domain/catalog/entity/interfaces/product.interface';
import { IProductRepositoryWrite } from '../../../domain/catalog/repository/product.repository.write';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { ProductModel } from '../../db/mongo/models/product.model';
import { dbToInternal, internalToDb } from './adapters/product.adapter';

export class ProductRepositoryWrite implements IProductRepositoryWrite {
  async createProduct(product: IProduct): Promise<IProduct> {
    try {
      const doc = await ProductModel.create(internalToDb(product));
      return dbToInternal(doc);
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'ProductRepositoryWrite.createProduct',
        eventData: { product },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async updateProductById(
    id: string,
    data: Partial<IProduct>,
  ): Promise<IProduct | null> {
    try {
      const doc = await ProductModel.findOneAndUpdate(
        { id },
        { $set: data },
        { new: true },
      );
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'ProductRepositoryWrite.updateProductById',
        eventData: { id, data },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
