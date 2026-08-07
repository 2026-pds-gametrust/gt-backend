import { Types } from 'mongoose';
import { EFavoriteTargetType } from '../../domain/favorites/entity/enums/EFavoriteTargetType';
import { IFavorite } from '../../domain/favorites/entity/interfaces/favorite.interface';
import { ESynonymTargetType } from '../../domain/search/entity/enums/ESynonymTargetType';
import { ISearchDocument } from '../../domain/search/entity/interfaces/search-document.interface';
import { ISynonym } from '../../domain/search/entity/interfaces/synonym.interface';
import { IQueryLog } from '../../domain/search/entity/interfaces/query-log.interface';

export const validSearchDocumentMock = (
  override?: Partial<ISearchDocument>,
): ISearchDocument => ({
  id: new Types.ObjectId().toHexString(),
  listingId: new Types.ObjectId().toHexString(),
  productId: new Types.ObjectId().toHexString(),
  categoryId: new Types.ObjectId().toHexString(),
  sellerId: new Types.ObjectId().toHexString(),
  title: `GPU Listing ${Date.now()}`,
  brand: 'ASUS',
  model: 'RTX 4070',
  condition: 'GOOD',
  status: 'PUBLISHED',
  priceCents: 350000,
  currency: 'BRL',
  searchText: 'gpu listing asus rtx 4070',
  sourceOccurredAt: new Date(),
  updatedAt: new Date(),
  ...override,
});

export const validSynonymMock = (
  override?: Partial<ISynonym>,
): ISynonym => ({
  id: new Types.ObjectId().toHexString(),
  normalizedTerm: `term-${Date.now()}`,
  targetType: ESynonymTargetType.CATEGORY,
  targetId: new Types.ObjectId().toHexString(),
  canonicalName: 'GPUs',
  updatedAt: new Date(),
  ...override,
});

export const validQueryLogMock = (
  override?: Partial<IQueryLog>,
): IQueryLog => ({
  id: new Types.ObjectId().toHexString(),
  query: 'rtx',
  filters: {},
  resultCount: 0,
  createdAt: new Date(),
  ...override,
});

export const validFavoriteMock = (
  override?: Partial<IFavorite>,
): IFavorite => ({
  id: new Types.ObjectId().toHexString(),
  userId: new Types.ObjectId().toHexString(),
  targetType: EFavoriteTargetType.PRODUCT,
  targetId: new Types.ObjectId().toHexString(),
  createdAt: new Date(),
  ...override,
});
