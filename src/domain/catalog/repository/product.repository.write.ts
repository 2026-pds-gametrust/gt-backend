import { IProduct } from '../entity/interfaces/product.interface';

export interface IProductRepositoryWrite {
  createProduct(product: IProduct): Promise<IProduct>;
  updateProductById(
    id: string,
    data: Partial<IProduct>,
  ): Promise<IProduct | null>;
}
