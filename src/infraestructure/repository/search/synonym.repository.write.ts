import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { ISynonym } from '../../../domain/search/entity/interfaces/synonym.interface';
import { ISynonymRepositoryWrite } from '../../../domain/search/repository/synonym.repository.write';
import { SynonymModel } from '../../db/mongo/models/synonym.model';
import { dbToInternal, internalToDb } from './adapters/synonym.adapter';

export class SynonymRepositoryWrite implements ISynonymRepositoryWrite {
  async upsertSynonym(synonym: ISynonym): Promise<ISynonym> {
    try {
      const doc = await SynonymModel.findOneAndUpdate(
        { normalizedTerm: synonym.normalizedTerm },
        { $set: internalToDb(synonym) },
        { new: true, upsert: true },
      );
      return dbToInternal(doc!);
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'SynonymRepositoryWrite.upsertSynonym',
        eventData: { normalizedTerm: synonym.normalizedTerm },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
