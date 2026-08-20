import { IEventEnvelope } from '../../../common/messaging/event-envelope';
import { IEventHandler } from '../../../common/messaging/event-handler.interface';
import { IListingAnalysisService } from '../../service/listing-analysis.service.interface';

export class AiListingMediaProcessedHandler implements IEventHandler {
  constructor(private readonly listingAnalysisService: IListingAnalysisService) {}

  async handle(envelope: IEventEnvelope): Promise<void> {
    const purpose = String(envelope.payload?.purpose ?? '');
    if (purpose !== 'LISTING') {
      return;
    }

    const assetId = String(envelope.payload?.assetId ?? envelope.aggregateId ?? '').trim();
    if (!assetId) {
      return;
    }

    await this.listingAnalysisService.requestAnalysisForMediaAsset(assetId);
  }
}
