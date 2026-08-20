import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { EListingStatus } from '../../../domain/listings/entity/enums/EListingStatus';
import { IListing } from '../../../domain/listings/entity/interfaces/listing.interface';
import { IListingRepositoryWrite } from '../../../domain/listings/repository/listing.repository.write';
import { ListingModel } from '../../db/mongo/models/listing.model';
import { dbToInternal, internalToDb } from './adapters/listing.adapter';

export class ListingRepositoryWrite implements IListingRepositoryWrite {
  async createListing(listing: IListing): Promise<IListing> {
    try {
      const doc = await ListingModel.create(internalToDb(listing));
      return dbToInternal(doc);
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'ListingRepositoryWrite.createListing',
        eventData: { listing },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async updateListingById(
    id: string,
    data: Partial<IListing>,
  ): Promise<IListing | null> {
    try {
      const doc = await ListingModel.findOneAndUpdate(
        { id },
        { $set: data },
        { new: true },
      );
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'ListingRepositoryWrite.updateListingById',
        eventData: { id, data },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async reserveListingForOrder(params: {
    listingId: string;
    orderId: string;
    reservedAt: Date;
    reservationExpiresAt: Date;
  }): Promise<IListing | null> {
    try {
      const doc = await ListingModel.findOneAndUpdate(
        {
          id: params.listingId,
          status: EListingStatus.PUBLISHED,
        },
        {
          $set: {
            status: EListingStatus.RESERVED,
            reservedByOrderId: params.orderId,
            reservedAt: params.reservedAt,
            reservationExpiresAt: params.reservationExpiresAt,
          },
        },
        { new: true },
      );
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'ListingRepositoryWrite.reserveListingForOrder',
        eventData: params,
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async releaseListingReservation(params: {
    listingId: string;
    orderId: string;
  }): Promise<IListing | null> {
    try {
      const doc = await ListingModel.findOneAndUpdate(
        {
          id: params.listingId,
          status: EListingStatus.RESERVED,
          reservedByOrderId: params.orderId,
        },
        {
          $set: { status: EListingStatus.PUBLISHED },
          $unset: {
            reservedByOrderId: '',
            reservedAt: '',
            reservationExpiresAt: '',
          },
        },
        { new: true },
      );
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'ListingRepositoryWrite.releaseListingReservation',
        eventData: params,
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async markListingSold(params: {
    listingId: string;
    orderId: string;
  }): Promise<IListing | null> {
    try {
      const doc = await ListingModel.findOneAndUpdate(
        {
          id: params.listingId,
          status: EListingStatus.RESERVED,
          reservedByOrderId: params.orderId,
        },
        {
          $set: { status: EListingStatus.SOLD },
          $unset: {
            reservationExpiresAt: '',
          },
        },
        { new: true },
      );
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'ListingRepositoryWrite.markListingSold',
        eventData: params,
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async expireStaleReservations(now: Date): Promise<number> {
    try {
      const result = await ListingModel.updateMany(
        {
          status: EListingStatus.RESERVED,
          reservationExpiresAt: { $lte: now },
        },
        {
          $set: { status: EListingStatus.PUBLISHED },
          $unset: {
            reservedByOrderId: '',
            reservedAt: '',
            reservationExpiresAt: '',
          },
        },
      );
      return result.modifiedCount ?? 0;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'ListingRepositoryWrite.expireStaleReservations',
        eventData: { now },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
