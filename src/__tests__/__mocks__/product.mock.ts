import { randomUUID } from 'crypto';
import { Types } from 'mongoose';
import { EProductStatus } from '../../domain/catalog/entity/enums/EProductStatus';
import { IProduct } from '../../domain/catalog/entity/interfaces/product.interface';

export const validProductMock = (override?: Partial<IProduct>): IProduct => ({
  id: new Types.ObjectId().toHexString(),
  categoryId: new Types.ObjectId().toHexString(),
  brand: 'ASUS',
  model: `RTX-TEST-${randomUUID()}`,
  slug: `asus-rtx-${randomUUID()}`,
  sku: `SKU-${randomUUID()}`,
  referencePriceCents: 500000,
  currency: 'BRL',
  status: EProductStatus.ACTIVE,
  createdAt: new Date(),
  ...override,
});
