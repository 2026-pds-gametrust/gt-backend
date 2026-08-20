import { EProductStatus } from '../enums/EProductStatus';

export type TProductSpecValue = string | number | boolean;

export interface IProduct {
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
  imageAssetIds?: string[];
  referencePriceCents?: number;
  currency?: string;
  status: EProductStatus;
  createdAt: Date;
  updatedAt?: Date;
}
