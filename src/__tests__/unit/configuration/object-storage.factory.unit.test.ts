import { MemoryObjectStorage } from '../../../infraestructure/storage/memory-object-storage';
import { S3ObjectStorage } from '../../../infraestructure/storage/s3-object-storage';
import { ObjectStorageFactory } from '../../../configuration/factory/object-storage.factory';
import { useMemoryObjectStorage } from '../../../configuration/env-constants/storage.env';

describe('when resolving object storage for local development', () => {
  const original = { ...process.env };

  afterEach(() => {
    process.env = { ...original };
  });

  it('should use memory when NODE_ENV is not production and S3_ENDPOINT is unset', () => {
    process.env.NODE_ENV = 'development';
    delete process.env.S3_ENDPOINT;
    delete process.env.S3_USE_MEMORY;
    expect(useMemoryObjectStorage()).toBe(true);
    expect(ObjectStorageFactory.create()).toBeInstanceOf(MemoryObjectStorage);
  });

  it('should use S3 when NODE_ENV is production even without S3_USE_MEMORY', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.S3_USE_MEMORY;
    process.env.S3_ENDPOINT = 'http://localhost:4566';
    expect(useMemoryObjectStorage()).toBe(false);
    expect(ObjectStorageFactory.create()).toBeInstanceOf(S3ObjectStorage);
  });

  it('should force memory when S3_USE_MEMORY is true', () => {
    process.env.NODE_ENV = 'production';
    process.env.S3_USE_MEMORY = 'true';
    expect(useMemoryObjectStorage()).toBe(true);
  });
});
