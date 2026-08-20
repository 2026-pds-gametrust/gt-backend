import { MediaAssetService } from '../../domain/media/service/media-asset.service';
import { SharpImageProcessor } from '../../infraestructure/processing/sharp-image-processor';
import { EvidenceOwnershipLookup } from '../../infraestructure/media/evidence-ownership.lookup';
import { MediaAssetRepositoryRead } from '../../infraestructure/repository/media/media-asset.repository.read';
import { MediaAssetRepositoryWrite } from '../../infraestructure/repository/media/media-asset.repository.write';
import { ListingRepositoryRead } from '../../infraestructure/repository/listings/listing.repository.read';
import { VerificationCaseRepositoryRead } from '../../infraestructure/repository/verification/verification-case.repository.read';
import {
  S3_GET_URL_TTL_SECONDS,
  S3_PUBLIC_BASE_URL,
  S3_PUT_URL_TTL_SECONDS,
} from '../env-constants/storage.env';
import { EventPublisherFactory } from './messaging/event-publisher.factory';
import { ObjectStorageFactory } from './object-storage.factory';

export class MediaAssetServiceFactory {
  static create() {
    return new MediaAssetService({
      mediaAssetRepositoryRead: new MediaAssetRepositoryRead(),
      mediaAssetRepositoryWrite: new MediaAssetRepositoryWrite(),
      objectStorage: ObjectStorageFactory.create(),
      imageProcessor: new SharpImageProcessor(),
      eventPublisher: EventPublisherFactory.create(),
      ownershipLookup: new EvidenceOwnershipLookup(
        new VerificationCaseRepositoryRead(),
        new ListingRepositoryRead(),
      ),
      publicBaseUrl: S3_PUBLIC_BASE_URL,
      putUrlTtlSeconds: S3_PUT_URL_TTL_SECONDS,
      getUrlTtlSeconds: S3_GET_URL_TTL_SECONDS,
    });
  }
}
