import { IAnalysisChecklistItem } from '../entity/interfaces/listing-analysis.interface';

export interface IProofCodeAnalysisMediaPart {
  mimeType: string;
  data: Buffer;
  label: string;
}

/**
 * Provider input for possession-code vision assist.
 * Must NEVER include expected proof-code plaintext, hash, or pepper (DEC-071).
 */
export interface IParamsProofCodeAnalysisProviderInput {
  caseId: string;
  photos: IProofCodeAnalysisMediaPart[];
  video?: IProofCodeAnalysisMediaPart;
  checklistItemIds: string[];
}

export interface IProofCodeAnalysisProviderResult {
  items: IAnalysisChecklistItem[];
  modelId: string;
}

export interface IProofCodeAnalysisProvider {
  analyze(
    input: IParamsProofCodeAnalysisProviderInput,
  ): Promise<IProofCodeAnalysisProviderResult>;
}
