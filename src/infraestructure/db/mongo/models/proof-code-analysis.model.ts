import { Types, model } from 'mongoose';
import { IProofCodeAnalysis } from '../../../../domain/ai/entity/interfaces/proof-code-analysis.interface';
import { ProofCodeAnalysisSchema } from '../schema/proof-code-analysis.schema';

export interface IMProofCodeAnalysis extends Omit<IProofCodeAnalysis, '_id'> {
  _id: Types.ObjectId;
  updatedAt: Date;
}

export const ProofCodeAnalysisModel = model<IMProofCodeAnalysis>(
  'ProofCodeAnalysis',
  ProofCodeAnalysisSchema,
);
