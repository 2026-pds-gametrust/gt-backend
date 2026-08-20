import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { IProofCodeAnalysis } from '../../../domain/ai/entity/interfaces/proof-code-analysis.interface';
import { IProofCodeAnalysisRepositoryRead } from '../../../domain/ai/repository/proof-code-analysis.repository.read';
import { ProofCodeAnalysisModel } from '../../db/mongo/models/proof-code-analysis.model';
import { dbToInternal } from './adapters/proof-code-analysis.adapter';

export class ProofCodeAnalysisRepositoryRead
  implements IProofCodeAnalysisRepositoryRead
{
  async findProofCodeAnalysisById(
    id: string,
  ): Promise<IProofCodeAnalysis | null> {
    try {
      const doc = await ProofCodeAnalysisModel.findOne({ id });
      return doc ? dbToInternal(doc) : null;
    } catch (error: unknown) {
      serviceLogErrorHandler(error as Error, {
        eventName: 'ProofCodeAnalysisRepositoryRead.findProofCodeAnalysisById',
        eventData: { id },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async findLatestByCaseId(caseId: string): Promise<IProofCodeAnalysis | null> {
    try {
      const doc = await ProofCodeAnalysisModel.findOne({ caseId })
        .sort({ createdAt: -1 })
        .limit(1);
      return doc ? dbToInternal(doc) : null;
    } catch (error: unknown) {
      serviceLogErrorHandler(error as Error, {
        eventName: 'ProofCodeAnalysisRepositoryRead.findLatestByCaseId',
        eventData: { caseId },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
