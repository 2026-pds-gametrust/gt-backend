import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { escapeRegexLiteral } from '../../../domain/common/types/regex-literal';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { EListingStatus } from '../../../domain/listings/entity/enums/EListingStatus';
import { IListing } from '../../../domain/listings/entity/interfaces/listing.interface';
import {
  IListingRepositoryRead,
  IParamsListPublicListings,
  IParamsListSellerListings,
} from '../../../domain/listings/repository/listing.repository.read';
import { ListingModel } from '../../db/mongo/models/listing.model';
import { dbToInternal } from './adapters/listing.adapter';

export class ListingRepositoryRead implements IListingRepositoryRead {
  async findListingById(id: string): Promise<IListing | null> {
    try {
      const doc = await ListingModel.findOne({ id });
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'ListingRepositoryRead.findListingById',
        eventData: { id },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async listListings(filter: Partial<IListing> = {}): Promise<IListing[]> {
    try {
      const docs = await ListingModel.find(filter);
      return docs.map(dbToInternal);
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'ListingRepositoryRead.listListings',
        eventData: { filter },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async listPublicListings(
    params: IParamsListPublicListings,
  ): Promise<IListing[]> {
    try {
      const docs = await ListingModel.find({ status: EListingStatus.PUBLISHED })
        .sort({ createdAt: -1 })
        .skip(params.offset)
        .limit(params.limit);
      return docs.map(dbToInternal);
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'ListingRepositoryRead.listPublicListings',
        eventData: { params },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async countPublicListings(): Promise<number> {
    try {
      return ListingModel.countDocuments({ status: EListingStatus.PUBLISHED });
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'ListingRepositoryRead.countPublicListings',
        eventData: {},
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async listSellerListings(
    params: IParamsListSellerListings,
  ): Promise<IListing[]> {
    try {
      const filter: Record<string, unknown> = { sellerId: params.sellerId };
      if (params.status) {
        filter.status = params.status;
      }
      const docs = await ListingModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(params.offset)
        .limit(params.limit);
      return docs.map(dbToInternal);
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'ListingRepositoryRead.listSellerListings',
        eventData: { params },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async countSellerListings(
    sellerId: string,
    status?: EListingStatus,
  ): Promise<number> {
    try {
      const filter: Record<string, unknown> = { sellerId };
      if (status) {
        filter.status = status;
      }
      return ListingModel.countDocuments(filter);
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'ListingRepositoryRead.countSellerListings',
        eventData: { sellerId, status },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async findListingIdsByTitleSearch(
    query: string,
    limit: number,
  ): Promise<string[]> {
    const trimmed = query.trim();
    if (!trimmed) {
      return [];
    }
    try {
      const escaped = escapeRegexLiteral(trimmed);
      const docs = await ListingModel.find({
        title: { $regex: escaped, $options: 'i' },
      })
        .limit(limit)
        .select('id');
      return docs.map((doc) => doc.id);
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'ListingRepositoryRead.findListingIdsByTitleSearch',
        eventData: { queryLength: trimmed.length, limit },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async findListingIdsBySellerIds(sellerIds: string[]): Promise<string[]> {
    if (sellerIds.length === 0) {
      return [];
    }
    try {
      const docs = await ListingModel.find({
        sellerId: { $in: sellerIds },
      }).select('id');
      return docs.map((doc) => doc.id);
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'ListingRepositoryRead.findListingIdsBySellerIds',
        eventData: { sellerIdsCount: sellerIds.length },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async findListingsByIds(ids: string[]): Promise<IListing[]> {
    if (ids.length === 0) {
      return [];
    }
    try {
      const docs = await ListingModel.find({ id: { $in: ids } });
      return docs.map(dbToInternal);
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'ListingRepositoryRead.findListingsByIds',
        eventData: { idsCount: ids.length },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async findListingIdsByMediaAssetId(assetId: string): Promise<string[]> {
    const trimmed = assetId.trim();
    if (!trimmed) {
      return [];
    }
    try {
      const docs = await ListingModel.find({
        $or: [
          { 'media.assetIds': trimmed },
          { 'media.videoAssetId': trimmed },
        ],
      }).select('id');
      return docs.map((doc) => doc.id);
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'ListingRepositoryRead.findListingIdsByMediaAssetId',
        eventData: { assetId: trimmed },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
