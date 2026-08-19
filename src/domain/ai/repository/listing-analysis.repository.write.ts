import { IListingAnalysis } from '../entity/interfaces/listing-analysis.interface';

export interface IListingAnalysisRepositoryWrite {
  createListingAnalysis(analysis: IListingAnalysis): Promise<IListingAnalysis>;
  updateListingAnalysisById(
    id: string,
    data: Partial<IListingAnalysis>,
  ): Promise<IListingAnalysis | null>;
}
