import { IEventEnvelope } from '../../../common/messaging/event-envelope';
import { IEventHandler } from '../../../common/messaging/event-handler.interface';
import { IMediaAssetService } from '../../service/media-asset.service.interface';

export class MediaAssetUploadedHandler implements IEventHandler {
  constructor(private readonly mediaAssetService: IMediaAssetService) {}

  async handle(envelope: IEventEnvelope): Promise<void> {
    const assetId = String(envelope.payload?.assetId ?? envelope.aggregateId);
    if (!assetId) {
      return;
    }
    await this.mediaAssetService.processUploadedAsset(assetId);
  }
}
