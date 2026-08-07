import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
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
}
