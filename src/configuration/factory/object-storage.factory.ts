import { IObjectStorage } from '../../domain/media/storage/object-storage.interface';
import { MemoryObjectStorage } from '../../infraestructure/storage/memory-object-storage';
import { S3ObjectStorage } from '../../infraestructure/storage/s3-object-storage';
import {
  S3_ENDPOINT,
  S3_PUBLIC_BUCKET,
  S3_REGION,
  S3_RESTRICTED_BUCKET,
  useMemoryObjectStorage,
} from '../env-constants/storage.env';

export class ObjectStorageFactory {
  static create(): IObjectStorage {
    if (useMemoryObjectStorage()) {
      return MemoryObjectStorage.instance();
    }
    return new S3ObjectStorage({
      region: S3_REGION,
      publicBucket: S3_PUBLIC_BUCKET,
      restrictedBucket: S3_RESTRICTED_BUCKET,
      endpoint: S3_ENDPOINT,
    });
  }
}
