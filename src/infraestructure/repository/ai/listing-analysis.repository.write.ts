import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { IListingAnalysis } from '../../../domain/ai/entity/interfaces/listing-analysis.interface';
import { IListingAnalysisRepositoryWrite } from '../../../domain/ai/repository/listing-analysis.repository.write';
import { ListingAnalysisModel } from '../../db/mongo/models/listing-analysis.model';
import { dbToInternal, internalToDb } from './adapters/listing-analysis.adapter';

export class ListingAnalysisRepositoryWrite
  implements IListingAnalysisRepositoryWrite
{
  async createListingAnalysis(
    analysis: IListingAnalysis,
  ): Promise<IListingAnalysis> {
    try {
      const doc = await ListingAnalysisModel.create(internalToDb(analysis));
      return dbToInternal(doc);
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'ListingAnalysisRepositoryWrite.createListingAnalysis',
        eventData: { id: analysis.id },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async updateListingAnalysisById(
    id: string,
    data: Partial<IListingAnalysis>,
  ): Promise<IListingAnalysis | null> {
    try {
      const doc = await ListingAnalysisModel.findOneAndUpdate(
        { id },
        { $set: data },
        { new: true },
      );
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'ListingAnalysisRepositoryWrite.updateListingAnalysisById',
        eventData: { id },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
