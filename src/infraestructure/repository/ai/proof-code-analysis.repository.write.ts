import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { IProofCodeAnalysis } from '../../../domain/ai/entity/interfaces/proof-code-analysis.interface';
import { IProofCodeAnalysisRepositoryWrite } from '../../../domain/ai/repository/proof-code-analysis.repository.write';
import { ProofCodeAnalysisModel } from '../../db/mongo/models/proof-code-analysis.model';
import {
  dbToInternal,
  internalToDb,
} from './adapters/proof-code-analysis.adapter';

export class ProofCodeAnalysisRepositoryWrite
  implements IProofCodeAnalysisRepositoryWrite
{
  async createProofCodeAnalysis(
    analysis: IProofCodeAnalysis,
  ): Promise<IProofCodeAnalysis> {
    try {
      const doc = await ProofCodeAnalysisModel.create(internalToDb(analysis));
      return dbToInternal(doc);
    } catch (error: unknown) {
      serviceLogErrorHandler(error as Error, {
        eventName: 'ProofCodeAnalysisRepositoryWrite.createProofCodeAnalysis',
        eventData: { id: analysis.id },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async updateProofCodeAnalysisById(
    id: string,
    data: Partial<IProofCodeAnalysis>,
  ): Promise<IProofCodeAnalysis | null> {
    try {
      const doc = await ProofCodeAnalysisModel.findOneAndUpdate(
        { id },
        { $set: data },
        { new: true },
      );
      return doc ? dbToInternal(doc) : null;
    } catch (error: unknown) {
      serviceLogErrorHandler(error as Error, {
        eventName:
          'ProofCodeAnalysisRepositoryWrite.updateProofCodeAnalysisById',
        eventData: { id },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
