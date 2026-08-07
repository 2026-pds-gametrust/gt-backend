import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { ISearchDocument } from '../../../domain/search/entity/interfaces/search-document.interface';
import { ISearchDocumentRepositoryWrite } from '../../../domain/search/repository/search-document.repository.write';
import { SearchDocumentModel } from '../../db/mongo/models/search-document.model';
import { dbToInternal, internalToDb } from './adapters/search-document.adapter';

export class SearchDocumentRepositoryWrite
  implements ISearchDocumentRepositoryWrite
{
  async upsertSearchDocument(doc: ISearchDocument): Promise<ISearchDocument> {
    try {
      const updated = await SearchDocumentModel.findOneAndUpdate(
        { listingId: doc.listingId },
        { $set: internalToDb(doc) },
        { new: true, upsert: true },
      );
      return dbToInternal(updated!);
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'SearchDocumentRepositoryWrite.upsertSearchDocument',
        eventData: { listingId: doc.listingId },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async deleteByListingId(listingId: string): Promise<boolean> {
    try {
      const result = await SearchDocumentModel.deleteOne({ listingId });
      return result.deletedCount > 0;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'SearchDocumentRepositoryWrite.deleteByListingId',
        eventData: { listingId },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
