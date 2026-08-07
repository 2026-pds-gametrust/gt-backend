import { IThrowedError } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../common/errors/enums/EErrorCode';
import { PriceHistoryServiceEntity } from '../entity/price-history.entity';
import { IPriceHistory } from '../entity/interfaces/price-history.interface';
import { IPriceHistoryRepositoryRead } from '../repository/price-history.repository.read';
import { IPriceHistoryRepositoryWrite } from '../repository/price-history.repository.write';
import { IProductRepositoryRead } from '../repository/product.repository.read';
import {
  IParamsAppendPriceHistory,
  IParamsPriceHistoryService,
  IPriceHistoryService,
} from './price-history.service.interface';

export class PriceHistoryService implements IPriceHistoryService {
  private readonly priceHistoryRepositoryRead: IPriceHistoryRepositoryRead;
  private readonly priceHistoryRepositoryWrite: IPriceHistoryRepositoryWrite;
  private readonly productRepositoryRead: IProductRepositoryRead;

  constructor({
    priceHistoryRepositoryRead,
    priceHistoryRepositoryWrite,
    productRepositoryRead,
  }: IParamsPriceHistoryService) {
    this.priceHistoryRepositoryRead = priceHistoryRepositoryRead;
    this.priceHistoryRepositoryWrite = priceHistoryRepositoryWrite;
    this.productRepositoryRead = productRepositoryRead;
  }

  async appendPriceHistory(
    params: IParamsAppendPriceHistory,
  ): Promise<IPriceHistory> {
    await this.assertProductExists(params.productId);
    const entity = new PriceHistoryServiceEntity({
      id: params.id,
      productId: params.productId,
      priceCents: params.priceCents,
      currency: params.currency ?? 'BRL',
      source: params.source,
      observedAt: params.observedAt ?? new Date(),
      createdAt: new Date(),
    });
    return this.priceHistoryRepositoryWrite.appendPriceHistory(entity);
  }

  async listByProductId(productId: string): Promise<IPriceHistory[]> {
    await this.assertProductExists(productId);
    return this.priceHistoryRepositoryRead.listByProductId(productId);
  }

  private async assertProductExists(productId: string): Promise<void> {
    const product = await this.productRepositoryRead.findProductById(productId);
    if (!product) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Product not found',
        details: { productId },
      } as IThrowedError;
    }
  }
}
