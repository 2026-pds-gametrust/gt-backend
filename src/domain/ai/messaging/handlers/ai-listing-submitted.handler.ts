import { IEventEnvelope } from '../../../common/messaging/event-envelope';
import { IEventHandler } from '../../../common/messaging/event-handler.interface';
import { EListingAnalysisScope } from '../../entity/enums/EListingAnalysisScope';
import { IListingAnalysisService } from '../../service/listing-analysis.service.interface';

export class AiListingSubmittedHandler implements IEventHandler {
  constructor(private readonly listingAnalysisService: IListingAnalysisService) {}

  async handle(envelope: IEventEnvelope): Promise<void> {
    const listingId = String(
      envelope.payload?.listingId ?? envelope.aggregateId ?? '',
    ).trim();
    if (!listingId) {
      return;
    }

    await this.listingAnalysisService.requestAnalysis(
      listingId,
      EListingAnalysisScope.SUBMIT,
    );
  }
}
