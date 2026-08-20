import { IProofCodeAnalysis } from '../entity/interfaces/proof-code-analysis.interface';

export interface IProofCodeAnalysisRepositoryRead {
  findProofCodeAnalysisById(id: string): Promise<IProofCodeAnalysis | null>;
  findLatestByCaseId(caseId: string): Promise<IProofCodeAnalysis | null>;
}
