import { IProduct } from '../entity/interfaces/product.interface';

export interface IProductRepositoryRead {
  findProductById(id: string): Promise<IProduct | null>;
  findProductBySlug(slug: string): Promise<IProduct | null>;
  findProductBySku(sku: string): Promise<IProduct | null>;
  listProducts(filter?: Partial<IProduct>): Promise<IProduct[]>;
}
