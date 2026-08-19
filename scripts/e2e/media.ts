/**
 * Upload de media ponta a ponta: cria o asset, faz o PUT no presigned URL do S3,
 * completa e espera o READY (que so chega depois de media.asset.uploaded percorrer
 * SNS -> SQS -> processUploadedAsset).
 */
import { get, post } from './client';
import { IActor } from './actors';
import { waitFor } from './poll';
import { MP4_STUB, listingPhoto } from './fixtures';

export async function uploadReadyAsset(
  actor: IActor,
  purpose: 'LISTING' | 'PRODUCT' | 'EVIDENCE',
  ownerId: string,
  kind: 'image' | 'video',
): Promise<string> {
  const bytes = kind === 'image' ? await listingPhoto() : MP4_STUB;
  const contentType = kind === 'image' ? 'image/jpeg' : 'video/mp4';

  const created = await post<{ id: string; upload: { url: string; headers?: Record<string, string> } }>(
    '/media/uploads',
    { token: actor.accessToken, body: { purpose, ownerId, contentType, byteSize: bytes.length } },
  );
  if (created.status !== 201) {
    throw new Error(`media upload (${purpose}/${kind}) falhou: ${created.status} ${JSON.stringify(created.body)}`);
  }

  const uploaded = await fetch(created.body.upload.url, {
    method: 'PUT',
    headers: { 'Content-Type': contentType, ...(created.body.upload.headers ?? {}) },
    body: new Uint8Array(bytes),
  });
  if (uploaded.status !== 200) {
    throw new Error(`PUT presigned falhou: ${uploaded.status}`);
  }

  await post(`/media/uploads/${created.body.id}/complete`, { token: actor.accessToken });

  await waitFor(`asset ${kind} READY`, async () => {
    const asset = await get<{ status: string }>(`/media/assets/${created.body.id}`, {
      token: actor.accessToken,
    });
    return asset.status === 200 && asset.body.status === 'READY' ? asset.body : null;
  });

  return created.body.id;
}

/** Cria um listing pronto para submit (foto + video READY). */
export async function createReadyListing(
  seller: IActor,
  productId: string,
  title: string,
): Promise<string> {
  const photoAssetId = await uploadReadyAsset(seller, 'LISTING', seller.userId, 'image');
  const videoAssetId = await uploadReadyAsset(seller, 'LISTING', seller.userId, 'video');
  const id = `listing-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

  const created = await post(`/listings`, {
    token: seller.accessToken,
    body: {
      id,
      sellerId: seller.userId,
      productId,
      title,
      condition: 'GOOD',
      priceCents: 320000,
      currency: 'BRL',
      media: { photoUrls: [], assetIds: [photoAssetId], videoAssetId },
      shipping: { modes: ['PICKUP'] },
    },
  });
  if (created.status !== 201) {
    throw new Error(`createReadyListing falhou: ${created.status} ${JSON.stringify(created.body)}`);
  }
  return id;
}
