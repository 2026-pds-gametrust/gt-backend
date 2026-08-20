import { createMoney } from '../../common/types/money';
import {
  requireNonEmptyString,
  requireNonEmptyWhenProvided,
} from '../../common/types/required-string';
import { EProductStatus } from './enums/EProductStatus';
import { IProduct } from './interfaces/product.interface';

export class ProductServiceEntity implements IProduct {
  id: string;
  categoryId: string;
  brand: string;
  model: string;
  series?: string;
  slug: string;
  mpn?: string;
  ean?: string;
  sku?: string;
  specs?: Record<string, string | number | boolean>;
  imageUrls?: string[];
  imageAssetIds?: string[];
  referencePriceCents?: number;
  currency?: string;
  status: EProductStatus;
  createdAt: Date;
  updatedAt?: Date;

  constructor(product: IProduct) {
    this.validate(product);
    this.id = product.id;
    this.categoryId = product.categoryId;
    this.brand = product.brand.trim();
    this.model = product.model.trim();
    this.series = product.series?.trim();
    this.slug = product.slug.trim().toLowerCase();
    this.mpn = product.mpn?.trim();
    this.ean = product.ean?.trim();
    this.sku = product.sku?.trim();
    this.specs = product.specs;
    this.imageUrls = product.imageUrls;
    this.imageAssetIds = product.imageAssetIds;
    this.referencePriceCents = product.referencePriceCents;
    this.currency = product.currency
      ? product.currency.toUpperCase()
      : product.referencePriceCents !== undefined
        ? 'BRL'
        : undefined;
    this.status = product.status ?? EProductStatus.ACTIVE;
    this.createdAt = product.createdAt || new Date();
    this.updatedAt = product.updatedAt;
  }

  private validate(product: IProduct): void {
    requireNonEmptyString(product.id, 'id');
    requireNonEmptyString(product.categoryId, 'categoryId');
    requireNonEmptyString(product.brand, 'brand');
    requireNonEmptyString(product.model, 'model');
    requireNonEmptyString(product.slug, 'slug');
    requireNonEmptyWhenProvided(product.sku, 'sku');
    requireNonEmptyWhenProvided(product.mpn, 'mpn');
    requireNonEmptyWhenProvided(product.ean, 'ean');
    if (product.referencePriceCents !== undefined) {
      createMoney(
        product.referencePriceCents,
        product.currency ?? 'BRL',
      );
    }
  }
}
