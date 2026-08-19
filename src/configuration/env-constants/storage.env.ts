const DEFAULT_PUT_TTL_SECONDS = 900;
const DEFAULT_GET_TTL_SECONDS = 300;
const DEFAULT_REGION = 'us-east-1';

export const S3_PUBLIC_BUCKET =
  process.env.S3_PUBLIC_BUCKET || 'gt-media-public';
export const S3_RESTRICTED_BUCKET =
  process.env.S3_RESTRICTED_BUCKET || 'gt-media-restricted';
export const S3_REGION = process.env.S3_REGION || DEFAULT_REGION;
export const S3_ENDPOINT = process.env.S3_ENDPOINT?.trim() || undefined;
export const S3_PUBLIC_BASE_URL = (
  process.env.S3_PUBLIC_BASE_URL ||
  (S3_ENDPOINT
    ? `${S3_ENDPOINT.replace(/\/$/, '')}/${S3_PUBLIC_BUCKET}`
    : `https://${S3_PUBLIC_BUCKET}.s3.${S3_REGION}.amazonaws.com`)
).replace(/\/$/, '');

export const S3_PUT_URL_TTL_SECONDS = Number(
  process.env.S3_PUT_URL_TTL_SECONDS || DEFAULT_PUT_TTL_SECONDS,
);
export const S3_GET_URL_TTL_SECONDS = Number(
  process.env.S3_GET_URL_TTL_SECONDS || DEFAULT_GET_TTL_SECONDS,
);

export function useMemoryObjectStorage(): boolean {
  if (
    process.env.NODE_ENV === 'test' ||
    process.env.S3_USE_MEMORY === 'true'
  ) {
    return true;
  }
  // Local/dev without S3 config: avoid SDK calls to real AWS that explode as 500.
  const endpoint = process.env.S3_ENDPOINT?.trim();
  if (process.env.NODE_ENV !== 'production' && !endpoint) {
    return true;
  }
  return false;
}
