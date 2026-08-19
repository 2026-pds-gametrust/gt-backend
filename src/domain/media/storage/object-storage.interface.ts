import { EMediaBucketClass } from '../entity/enums/EMediaBucketClass';

export interface IPresignedUrl {
  url: string;
  headers: Record<string, string>;
  expiresAt: Date;
}

export interface IObjectHead {
  contentType?: string;
  contentLength: number;
}

export interface IObjectStorage {
  createPresignedPut(params: {
    bucketClass: EMediaBucketClass;
    key: string;
    contentType: string;
    contentLength: number;
    expiresSeconds: number;
  }): Promise<IPresignedUrl>;
  createPresignedGet(params: {
    bucketClass: EMediaBucketClass;
    key: string;
    expiresSeconds: number;
  }): Promise<IPresignedUrl>;
  headObject(params: {
    bucketClass: EMediaBucketClass;
    key: string;
  }): Promise<IObjectHead | null>;
  getObject(params: {
    bucketClass: EMediaBucketClass;
    key: string;
  }): Promise<Buffer | null>;
  putObject(params: {
    bucketClass: EMediaBucketClass;
    key: string;
    body: Buffer;
    contentType: string;
  }): Promise<void>;
}
