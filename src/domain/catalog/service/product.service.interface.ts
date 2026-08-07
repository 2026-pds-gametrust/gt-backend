import { IEventPublisher } from '../../common/messaging/event-publisher.interface';
import { EProductStatus } from '../entity/enums/EProductStatus';
import { IProduct, TProductSpecValue } from '../entity/interfaces/product.interface';
import { ICategoryRepositoryRead } from '../repository/category.repository.read';
import { IPriceHistoryRepositoryWrite } from '../repository/price-history.repository.write';
import { IProductRepositoryRead } from '../repository/product.repository.read';
import { IProductRepositoryWrite } from '../repository/product.repository.write';

export interface IParamsCreateProduct {
  id: string;
  categoryId: string;
  brand: string;
  model: string;
  series?: string;
  slug: string;
  mpn?: string;
  ean?: string;
  sku?: string;
  specs?: Record<string, TProductSpecValue>;
  imageUrls?: string[];
  referencePriceCents?: number;
  currency?: string;
  status?: EProductStatus;
}

export interface IParamsUpdateProduct {
  productData: Partial<
    Pick<
      IProduct,
      | 'brand'
      | 'model'
      | 'series'
      | 'mpn'
      | 'ean'
      | 'sku'
      | 'specs'
      | 'imageUrls'
      | 'referencePriceCents'
      | 'currency'
      | 'status'
    >
  >;
}

export interface IParamsProductService {
  productRepositoryRead: IProductRepositoryRead;
  productRepositoryWrite: IProductRepositoryWrite;
  categoryRepositoryRead: ICategoryRepositoryRead;
  priceHistoryRepositoryWrite: IPriceHistoryRepositoryWrite;
  eventPublisher: IEventPublisher;
}

export interface IProductService {
  createProduct(params: IParamsCreateProduct): Promise<IProduct>;
  getProductById(id: string): Promise<IProduct>;
  listProducts(filter?: Partial<IProduct>): Promise<IProduct[]>;
  updateProductById(
    id: string,
    params: IParamsUpdateProduct,
  ): Promise<IProduct>;
}
