import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { ISynonym } from '../../../domain/search/entity/interfaces/synonym.interface';
import { ISynonymRepositoryRead } from '../../../domain/search/repository/synonym.repository.read';
import { SynonymModel } from '../../db/mongo/models/synonym.model';
import { dbToInternal } from './adapters/synonym.adapter';

export class SynonymRepositoryRead implements ISynonymRepositoryRead {
  async findByNormalizedTerm(
    normalizedTerm: string,
  ): Promise<ISynonym | null> {
    try {
      const doc = await SynonymModel.findOne({ normalizedTerm });
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'SynonymRepositoryRead.findByNormalizedTerm',
        eventData: { normalizedTerm },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async findById(id: string): Promise<ISynonym | null> {
    try {
      const doc = await SynonymModel.findOne({ id });
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'SynonymRepositoryRead.findById',
        eventData: { id },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async listByQuery(q?: string): Promise<ISynonym[]> {
    try {
      if (!q?.trim()) {
        const docs = await SynonymModel.find().limit(100);
        return docs.map(dbToInternal);
      }
      const escaped = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const docs = await SynonymModel.find({
        $or: [
          { normalizedTerm: { $regex: escaped, $options: 'i' } },
          { canonicalName: { $regex: escaped, $options: 'i' } },
        ],
      }).limit(100);
      return docs.map(dbToInternal);
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'SynonymRepositoryRead.listByQuery',
        eventData: { q },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
