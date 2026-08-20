import { IEventEnvelope } from '../../../common/messaging/event-envelope';
import { IEventHandler } from '../../../common/messaging/event-handler.interface';
import { IListingAnalysisService } from '../../service/listing-analysis.service.interface';

export class AiListingAnalyzedHandler implements IEventHandler {
  constructor(private readonly listingAnalysisService: IListingAnalysisService) {}

  async handle(envelope: IEventEnvelope): Promise<void> {
    await this.listingAnalysisService.handleAnalyzedEvent(envelope);
  }
}
