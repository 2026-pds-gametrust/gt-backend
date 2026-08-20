import { EMediaBucketClass } from '../../domain/media/entity/enums/EMediaBucketClass';
import {
  IObjectHead,
  IObjectStorage,
  IPresignedUrl,
} from '../../domain/media/storage/object-storage.interface';

interface IStoredObject {
  body: Buffer;
  contentType: string;
}

export class MemoryObjectStorage implements IObjectStorage {
  private static singleton: MemoryObjectStorage | null = null;
  private readonly objects = new Map<string, IStoredObject>();

  static instance(): MemoryObjectStorage {
    if (!this.singleton) {
      this.singleton = new MemoryObjectStorage();
    }
    return this.singleton;
  }

  static reset(): void {
    this.singleton?.objects.clear();
    this.singleton = null;
  }

  async createPresignedPut(params: {
    bucketClass: EMediaBucketClass;
    key: string;
    contentType: string;
    contentLength: number;
    expiresSeconds: number;
  }): Promise<IPresignedUrl> {
    return {
      url: this.memoryUrl(params.bucketClass, params.key),
      headers: {
        'Content-Type': params.contentType,
        'Content-Length': String(params.contentLength),
      },
      expiresAt: new Date(Date.now() + params.expiresSeconds * 1000),
    };
  }

  async createPresignedGet(params: {
    bucketClass: EMediaBucketClass;
    key: string;
    expiresSeconds: number;
  }): Promise<IPresignedUrl> {
    return {
      url: this.memoryUrl(params.bucketClass, params.key),
      headers: {},
      expiresAt: new Date(Date.now() + params.expiresSeconds * 1000),
    };
  }

  async headObject(params: {
    bucketClass: EMediaBucketClass;
    key: string;
  }): Promise<IObjectHead | null> {
    const stored = this.objects.get(this.compositeKey(params.bucketClass, params.key));
    if (!stored) {
      return null;
    }
    return {
      contentType: stored.contentType,
      contentLength: stored.body.length,
    };
  }

  async getObject(params: {
    bucketClass: EMediaBucketClass;
    key: string;
  }): Promise<Buffer | null> {
    const stored = this.objects.get(this.compositeKey(params.bucketClass, params.key));
    return stored ? Buffer.from(stored.body) : null;
  }

  async putObject(params: {
    bucketClass: EMediaBucketClass;
    key: string;
    body: Buffer;
    contentType: string;
  }): Promise<void> {
    this.objects.set(this.compositeKey(params.bucketClass, params.key), {
      body: Buffer.from(params.body),
      contentType: params.contentType,
    });
  }

  private compositeKey(bucketClass: EMediaBucketClass, key: string): string {
    return `${bucketClass}:${key}`;
  }

  private memoryUrl(bucketClass: EMediaBucketClass, key: string): string {
    return `memory://${bucketClass.toLowerCase()}/${key}`;
  }
}
