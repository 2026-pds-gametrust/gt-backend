import { EListingAnalysisScope } from '../entity/enums/EListingAnalysisScope';
import { IListingAnalysis } from '../entity/interfaces/listing-analysis.interface';

export interface IListingAnalysisRepositoryRead {
  findLatestByListingIdAndScope(
    listingId: string,
    scope: EListingAnalysisScope,
  ): Promise<IListingAnalysis | null>;
  findListingAnalysisById(id: string): Promise<IListingAnalysis | null>;
  findLatestByListingId(listingId: string): Promise<IListingAnalysis | null>;
}
