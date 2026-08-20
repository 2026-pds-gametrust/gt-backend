import { IProofCodeAnalysis } from '../entity/interfaces/proof-code-analysis.interface';

export interface IProofCodeAnalysisRepositoryWrite {
  createProofCodeAnalysis(
    analysis: IProofCodeAnalysis,
  ): Promise<IProofCodeAnalysis>;
  updateProofCodeAnalysisById(
    id: string,
    data: Partial<IProofCodeAnalysis>,
  ): Promise<IProofCodeAnalysis | null>;
}
