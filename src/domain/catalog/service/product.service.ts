import { IThrowedError } from '@sauvvitech/st-packages';
import { randomUUID } from 'crypto';
import { EErrorCode } from '../../common/errors/enums/EErrorCode';
import { createEventEnvelope } from '../../common/messaging/event-envelope';
import { IEventPublisher } from '../../common/messaging/event-publisher.interface';
import { PriceHistoryServiceEntity } from '../entity/price-history.entity';
import { ProductServiceEntity } from '../entity/product.entity';
import { EPriceHistorySource } from '../entity/enums/EPriceHistorySource';
import { EProductStatus } from '../entity/enums/EProductStatus';
import { IProduct } from '../entity/interfaces/product.interface';
import { ICategoryRepositoryRead } from '../repository/category.repository.read';
import { IPriceHistoryRepositoryWrite } from '../repository/price-history.repository.write';
import { IProductRepositoryRead } from '../repository/product.repository.read';
import { IProductRepositoryWrite } from '../repository/product.repository.write';
import { IMediaClient } from '../../media/client/media.client';
import { EMediaPurpose } from '../../media/entity/enums/EMediaPurpose';
import {
  IParamsCreateProduct,
  IParamsProductService,
  IParamsUpdateProduct,
  IProductService,
} from './product.service.interface';

export class ProductService implements IProductService {
  private readonly productRepositoryRead: IProductRepositoryRead;
  private readonly productRepositoryWrite: IProductRepositoryWrite;
  private readonly categoryRepositoryRead: ICategoryRepositoryRead;
  private readonly priceHistoryRepositoryWrite: IPriceHistoryRepositoryWrite;
  private readonly eventPublisher: IEventPublisher;
  private readonly mediaClient?: IMediaClient;

  constructor({
    productRepositoryRead,
    productRepositoryWrite,
    categoryRepositoryRead,
    priceHistoryRepositoryWrite,
    eventPublisher,
    mediaClient,
  }: IParamsProductService) {
    this.productRepositoryRead = productRepositoryRead;
    this.productRepositoryWrite = productRepositoryWrite;
    this.categoryRepositoryRead = categoryRepositoryRead;
    this.priceHistoryRepositoryWrite = priceHistoryRepositoryWrite;
    this.eventPublisher = eventPublisher;
    this.mediaClient = mediaClient;
  }

  async createProduct(params: IParamsCreateProduct): Promise<IProduct> {
    await this.assertCategoryExists(params.categoryId);
    const images = await this.resolveProductImages(
      params.id,
      params.imageAssetIds,
      params.imageUrls,
    );

    const entity = new ProductServiceEntity({
      id: params.id,
      categoryId: params.categoryId,
      brand: params.brand,
      model: params.model,
      series: params.series,
      slug: params.slug,
      mpn: params.mpn,
      ean: params.ean,
      sku: params.sku,
      specs: params.specs,
      imageUrls: images.imageUrls,
      imageAssetIds: images.imageAssetIds,
      referencePriceCents: params.referencePriceCents,
      currency: params.currency,
      status: params.status ?? EProductStatus.ACTIVE,
      createdAt: new Date(),
    });

    await this.assertUniqueSlug(entity.slug);
    if (entity.sku) {
      await this.assertUniqueSku(entity.sku);
    }

    const created = await this.productRepositoryWrite.createProduct(entity);

    if (created.referencePriceCents !== undefined) {
      await this.appendReferencePrice(created);
    }

    await this.eventPublisher.publish(
      createEventEnvelope({
        eventId: randomUUID(),
        eventType: 'catalog.product.created',
        aggregateId: created.id,
        producerModule: 'catalog',
        correlationId: randomUUID(),
        payload: {
          productId: created.id,
          categoryId: created.categoryId,
          slug: created.slug,
        },
      }),
    );

    return created;
  }

  async getProductById(id: string): Promise<IProduct> {
    const product = await this.productRepositoryRead.findProductById(id);
    if (!product) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Product not found',
        details: { id },
      } as IThrowedError;
    }
    return product;
  }

  async listProducts(filter: Partial<IProduct> = {}): Promise<IProduct[]> {
    return this.productRepositoryRead.listProducts(filter);
  }

  async updateProductById(
    id: string,
    params: IParamsUpdateProduct,
  ): Promise<IProduct> {
    const existing = await this.getProductById(id);
    const productData = { ...params.productData };
    if (productData.imageAssetIds) {
      const images = await this.resolveProductImages(
        id,
        productData.imageAssetIds,
        productData.imageUrls ?? existing.imageUrls,
      );
      productData.imageUrls = images.imageUrls;
      productData.imageAssetIds = images.imageAssetIds;
    }
    const candidate = new ProductServiceEntity({
      ...existing,
      ...productData,
      slug: existing.slug,
      categoryId: existing.categoryId,
    });

    if (
      candidate.sku &&
      candidate.sku !== existing.sku
    ) {
      await this.assertUniqueSku(candidate.sku, id);
    }

    const updated = await this.productRepositoryWrite.updateProductById(id, {
      brand: candidate.brand,
      model: candidate.model,
      series: candidate.series,
      mpn: candidate.mpn,
      ean: candidate.ean,
      sku: candidate.sku,
      specs: candidate.specs,
      imageUrls: candidate.imageUrls,
      imageAssetIds: candidate.imageAssetIds,
      referencePriceCents: candidate.referencePriceCents,
      currency: candidate.currency,
      status: candidate.status,
    });

    if (!updated) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Product not found',
        details: { id },
      } as IThrowedError;
    }

    if (
      updated.referencePriceCents !== undefined &&
      updated.referencePriceCents !== existing.referencePriceCents
    ) {
      await this.appendReferencePrice(updated);
    }

    await this.eventPublisher.publish(
      createEventEnvelope({
        eventId: randomUUID(),
        eventType: 'catalog.product.updated',
        aggregateId: updated.id,
        producerModule: 'catalog',
        correlationId: randomUUID(),
        payload: {
          productId: updated.id,
          categoryId: updated.categoryId,
          slug: updated.slug,
          changed: Object.keys(params.productData),
        },
      }),
    );

    return updated;
  }

  private async appendReferencePrice(product: IProduct): Promise<void> {
    if (product.referencePriceCents === undefined) {
      return;
    }
    const entry = new PriceHistoryServiceEntity({
      id: randomUUID(),
      productId: product.id,
      priceCents: product.referencePriceCents,
      currency: product.currency ?? 'BRL',
      source: EPriceHistorySource.MANUAL,
      observedAt: new Date(),
      createdAt: new Date(),
    });
    await this.priceHistoryRepositoryWrite.appendPriceHistory(entry);
  }

  private async assertCategoryExists(categoryId: string): Promise<void> {
    const category =
      await this.categoryRepositoryRead.findCategoryById(categoryId);
    if (!category) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Category not found',
        details: { categoryId },
      } as IThrowedError;
    }
  }

  private async assertUniqueSlug(slug: string): Promise<void> {
    const existing = await this.productRepositoryRead.findProductBySlug(slug);
    if (existing) {
      throw {
        status: 409,
        errorCode: EErrorCode.RESOURCE_CONFLICT,
        message: 'Product slug already exists',
        details: { slug },
      } as IThrowedError;
    }
  }

  private async resolveProductImages(
    productId: string,
    imageAssetIds?: string[],
    fallbackUrls?: string[],
  ): Promise<{ imageUrls?: string[]; imageAssetIds?: string[] }> {
    if (!this.mediaClient || !imageAssetIds?.length) {
      return { imageUrls: fallbackUrls, imageAssetIds };
    }
    const imageUrls: string[] = [];
    for (const assetId of imageAssetIds) {
      await this.mediaClient.assertAttachableAsset({
        assetId,
        purpose: EMediaPurpose.PRODUCT,
        ownerId: productId,
      });
      const urls = await this.mediaClient.resolvePublicVariantUrls(assetId);
      if (urls[0]) {
        imageUrls.push(urls[0]);
      }
    }
    return { imageUrls, imageAssetIds };
  }

  private async assertUniqueSku(
    sku: string,
    excludeId?: string,
  ): Promise<void> {
    const existing = await this.productRepositoryRead.findProductBySku(sku);
    if (existing && existing.id !== excludeId) {
      throw {
        status: 409,
        errorCode: EErrorCode.RESOURCE_CONFLICT,
        message: 'Product sku already exists',
        details: { sku },
      } as IThrowedError;
    }
  }
}
