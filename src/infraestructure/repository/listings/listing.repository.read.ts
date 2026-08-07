import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { IListing } from '../../../domain/listings/entity/interfaces/listing.interface';
import { IListingRepositoryRead } from '../../../domain/listings/repository/listing.repository.read';
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
}
