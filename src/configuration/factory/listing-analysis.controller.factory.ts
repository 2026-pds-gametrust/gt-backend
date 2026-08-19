import { ListingAnalysisController } from '../../application/controllers/listing-analysis.controller';
import { ListingAnalysisServiceFactory } from './listing-analysis.service.factory';

export class ListingAnalysisControllerFactory {
  static create() {
    return new ListingAnalysisController(ListingAnalysisServiceFactory.create());
  }
}
