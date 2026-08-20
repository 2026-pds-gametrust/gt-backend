import { EListingStatus } from '../entity/enums/EListingStatus';
import { IListing } from '../entity/interfaces/listing.interface';

export interface IParamsListSellerListings {
  sellerId: string;
  status?: EListingStatus;
  limit: number;
  offset: number;
}

export interface IParamsListPublicListings {
  limit: number;
  offset: number;
}

export interface IListingRepositoryRead {
  findListingById(id: string): Promise<IListing | null>;
  listListings(filter?: Partial<IListing>): Promise<IListing[]>;
  listPublicListings(params: IParamsListPublicListings): Promise<IListing[]>;
  countPublicListings(): Promise<number>;
  listSellerListings(params: IParamsListSellerListings): Promise<IListing[]>;
  countSellerListings(
    sellerId: string,
    status?: EListingStatus,
  ): Promise<number>;
  findListingIdsByTitleSearch(query: string, limit: number): Promise<string[]>;
  findListingIdsBySellerIds(sellerIds: string[]): Promise<string[]>;
  findListingsByIds(ids: string[]): Promise<IListing[]>;
  findListingIdsByMediaAssetId(assetId: string): Promise<string[]>;
}
