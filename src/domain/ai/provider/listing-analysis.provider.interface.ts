import { EListingAnalysisScope } from '../entity/enums/EListingAnalysisScope';
import { IAnalysisChecklistItem } from '../entity/interfaces/listing-analysis.interface';

export interface IListingAnalysisMediaPart {
  mimeType: string;
  data: Buffer;
  label: string;
}

export interface IParamsListingAnalysisProviderInput {
  scope: EListingAnalysisScope;
  title: string;
  description?: string;
  condition: string;
  photos: IListingAnalysisMediaPart[];
  video?: IListingAnalysisMediaPart;
  checklistItemIds: string[];
}

export interface IListingAnalysisProviderResult {
  items: IAnalysisChecklistItem[];
  modelId: string;
}

export interface IListingAnalysisProvider {
  analyze(
    input: IParamsListingAnalysisProviderInput,
  ): Promise<IListingAnalysisProviderResult>;
}
