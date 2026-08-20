import { IProduct } from '../../../../domain/catalog/entity/interfaces/product.interface';
import { IMProduct } from '../../../db/mongo/models/product.model';

export function dbToInternal(doc: IMProduct): IProduct {
  return {
    id: doc.id,
    categoryId: doc.categoryId,
    brand: doc.brand,
    model: doc.model,
    series: doc.series,
    slug: doc.slug,
    mpn: doc.mpn,
    ean: doc.ean,
    sku: doc.sku,
    specs: doc.specs,
    imageUrls: doc.imageUrls,
    imageAssetIds: doc.imageAssetIds,
    referencePriceCents: doc.referencePriceCents,
    currency: doc.currency,
    status: doc.status,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export function internalToDb(
  product: IProduct,
): Omit<IMProduct, '_id' | 'createdAt' | 'updatedAt'> {
  return {
    id: product.id,
    categoryId: product.categoryId,
    brand: product.brand,
    model: product.model,
    series: product.series,
    slug: product.slug,
    mpn: product.mpn,
    ean: product.ean,
    sku: product.sku,
    specs: product.specs,
    imageUrls: product.imageUrls,
    imageAssetIds: product.imageAssetIds,
    referencePriceCents: product.referencePriceCents,
    currency: product.currency,
    status: product.status,
  };
}
