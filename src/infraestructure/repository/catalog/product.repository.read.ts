import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { IProduct } from '../../../domain/catalog/entity/interfaces/product.interface';
import { IProductRepositoryRead } from '../../../domain/catalog/repository/product.repository.read';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { ProductModel } from '../../db/mongo/models/product.model';
import { dbToInternal } from './adapters/product.adapter';

export class ProductRepositoryRead implements IProductRepositoryRead {
  async findProductById(id: string): Promise<IProduct | null> {
    try {
      const doc = await ProductModel.findOne({ id });
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'ProductRepositoryRead.findProductById',
        eventData: { id },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async findProductBySlug(slug: string): Promise<IProduct | null> {
    try {
      const doc = await ProductModel.findOne({ slug });
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'ProductRepositoryRead.findProductBySlug',
        eventData: { slug },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async findProductBySku(sku: string): Promise<IProduct | null> {
    try {
      const doc = await ProductModel.findOne({ sku });
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'ProductRepositoryRead.findProductBySku',
        eventData: { sku },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async listProducts(filter: Partial<IProduct> = {}): Promise<IProduct[]> {
    try {
      const docs = await ProductModel.find(filter);
      return docs.map(dbToInternal);
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'ProductRepositoryRead.listProducts',
        eventData: { filter },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
