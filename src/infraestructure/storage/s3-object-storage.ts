import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NodeHttpHandler } from '@smithy/node-http-handler';
import { EMediaBucketClass } from '../../domain/media/entity/enums/EMediaBucketClass';
import {
  IObjectHead,
  IObjectStorage,
  IPresignedUrl,
} from '../../domain/media/storage/object-storage.interface';

export interface IParamsS3ObjectStorage {
  region: string;
  publicBucket: string;
  restrictedBucket: string;
  endpoint?: string;
}

export class S3ObjectStorage implements IObjectStorage {
  private readonly client: S3Client;
  private readonly publicBucket: string;
  private readonly restrictedBucket: string;

  constructor(params: IParamsS3ObjectStorage) {
    this.publicBucket = params.publicBucket;
    this.restrictedBucket = params.restrictedBucket;
    this.client = new S3Client({
      region: params.region,
      endpoint: params.endpoint,
      forcePathStyle: Boolean(params.endpoint),
      requestHandler: new NodeHttpHandler({
        connectionTimeout: 3000,
        requestTimeout: 10000,
        throwOnRequestTimeout: true,
      }),
    });
  }

  async createPresignedPut(params: {
    bucketClass: EMediaBucketClass;
    key: string;
    contentType: string;
    contentLength: number;
    expiresSeconds: number;
  }): Promise<IPresignedUrl> {
    const command = new PutObjectCommand({
      Bucket: this.bucket(params.bucketClass),
      Key: params.key,
      ContentType: params.contentType,
      ContentLength: params.contentLength,
    });
    const url = await getSignedUrl(this.client, command, {
      expiresIn: params.expiresSeconds,
    });
    return {
      url,
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
    const command = new GetObjectCommand({
      Bucket: this.bucket(params.bucketClass),
      Key: params.key,
    });
    const url = await getSignedUrl(this.client, command, {
      expiresIn: params.expiresSeconds,
    });
    return {
      url,
      headers: {},
      expiresAt: new Date(Date.now() + params.expiresSeconds * 1000),
    };
  }

  async headObject(params: {
    bucketClass: EMediaBucketClass;
    key: string;
  }): Promise<IObjectHead | null> {
    try {
      const result = await this.client.send(
        new HeadObjectCommand({
          Bucket: this.bucket(params.bucketClass),
          Key: params.key,
        }),
      );
      return {
        contentType: result.ContentType,
        contentLength: result.ContentLength ?? 0,
      };
    } catch {
      return null;
    }
  }

  async getObject(params: {
    bucketClass: EMediaBucketClass;
    key: string;
  }): Promise<Buffer | null> {
    try {
      const result = await this.client.send(
        new GetObjectCommand({
          Bucket: this.bucket(params.bucketClass),
          Key: params.key,
        }),
      );
      if (!result.Body) {
        return null;
      }
      return Buffer.from(await result.Body.transformToByteArray());
    } catch {
      return null;
    }
  }

  async putObject(params: {
    bucketClass: EMediaBucketClass;
    key: string;
    body: Buffer;
    contentType: string;
  }): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket(params.bucketClass),
        Key: params.key,
        Body: params.body,
        ContentType: params.contentType,
      }),
    );
  }

  private bucket(bucketClass: EMediaBucketClass): string {
    return bucketClass === EMediaBucketClass.RESTRICTED
      ? this.restrictedBucket
      : this.publicBucket;
  }
}
