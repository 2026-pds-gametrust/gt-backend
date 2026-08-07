import { createMoney } from '../../common/types/money';
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
    if (!product.id?.trim()) {
      throw new Error('id is required');
    }
    if (!product.categoryId?.trim()) {
      throw new Error('categoryId is required');
    }
    if (!product.brand?.trim()) {
      throw new Error('brand is required');
    }
    if (!product.model?.trim()) {
      throw new Error('model is required');
    }
    if (!product.slug?.trim()) {
      throw new Error('slug is required');
    }
    if (product.sku !== undefined && !product.sku.trim()) {
      throw new Error('sku must be non-empty when provided');
    }
    if (product.mpn !== undefined && !product.mpn.trim()) {
      throw new Error('mpn must be non-empty when provided');
    }
    if (product.ean !== undefined && !product.ean.trim()) {
      throw new Error('ean must be non-empty when provided');
    }
    if (product.referencePriceCents !== undefined) {
      createMoney(
        product.referencePriceCents,
        product.currency ?? 'BRL',
      );
    }
  }
}
