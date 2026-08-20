/**
 * Fase 2 — Phase 1 funnel end-to-end over HTTP only.
 *
 * Every step is a real request against the running app; every cross-context effect
 * is asserted after travelling through SNS -> SQS (EVENT_INPROCESS_DISPATCH=false).
 * The existing Jest funnel calls services directly — this one never does.
 */
import { del, get, post, put } from './client';
import {
  IActor,
  grantGroups,
  loginAdmin,
  registerActor,
  reloginActor,
  uniqueId,
} from './actors';
import { waitFor } from './poll';
import { MP4_STUB, listingPhoto } from './fixtures';

interface IStepResult {
  step: string;
  endpoint: string;
  expected: number;
  got: number;
  ok: boolean;
  note?: string;
}

const results: IStepResult[] = [];

function record(
  step: string,
  endpoint: string,
  expected: number,
  got: number,
  note?: string,
): void {
  const ok = expected === got;
  results.push({ step, endpoint, expected, got, ok, note });
  const mark = ok ? 'PASS' : 'FAIL';
  console.log(
    `[${mark}] ${step.padEnd(38)} ${endpoint.padEnd(46)} expected=${expected} got=${got}${note ? ` (${note})` : ''}`,
  );
}

async function uploadMedia(
  actor: IActor,
  purpose: 'LISTING' | 'PRODUCT',
  ownerId: string,
  kind: 'image' | 'video',
): Promise<string> {
  const bytes = kind === 'image' ? await listingPhoto() : MP4_STUB;
  const contentType = kind === 'image' ? 'image/jpeg' : 'video/mp4';

  const created = await post<{ id: string; upload: { url: string; headers?: Record<string, string> } }>(
    '/media/uploads',
    {
      token: actor.accessToken,
      body: { purpose, ownerId, contentType, byteSize: bytes.length },
    },
  );
  record(`media upload (${kind})`, 'POST /media/uploads', 201, created.status);
  if (created.status !== 201) {
    throw new Error(`media upload failed: ${JSON.stringify(created.body)}`);
  }

  const putResponse = await fetch(created.body.upload.url, {
    method: 'PUT',
    headers: { 'Content-Type': contentType, ...(created.body.upload.headers ?? {}) },
    body: new Uint8Array(bytes),
  });
  record(`S3 presigned PUT (${kind})`, 'PUT <presigned>', 200, putResponse.status);

  const completed = await post<{ status: string }>(
    `/media/uploads/${created.body.id}/complete`,
    { token: actor.accessToken },
  );
  record(`media complete (${kind})`, 'POST /media/uploads/{id}/complete', 200, completed.status,
    `status=${completed.body?.status}`);

  // Sob dispatch assincrono real o complete devolve UPLOADED; o READY so chega
  // depois de media.asset.uploaded percorrer SNS -> SQS -> processUploadedAsset.
  await waitFor(`media asset ${kind} READY`, async () => {
    const asset = await get<{ status: string }>(`/media/assets/${created.body.id}`, {
      token: actor.accessToken,
    });
    return asset.status === 200 && asset.body.status === 'READY' ? asset.body : null;
  });
  record(`media READY via SQS (${kind})`, '[async] media.asset.processed', 1, 1);

  return created.body.id;
}

async function main(): Promise<void> {
  console.log('=== Fase 2 — funil Phase 1 via HTTP ===\n');

  // --- atores (uma vez; /auth/* e rate limited em 20 req / 15 min) ---
  const admin = await loginAdmin();
  record('login admin', 'POST /auth/login', 200, 200);

  const seller = await registerActor('seller');
  record('register seller', 'POST /auth/register', 201, 201);

  const buyer = await registerActor('buyer');
  record('register buyer', 'POST /auth/register', 201, 201);

  const backofficeRaw = await registerActor('backoffice');
  record('register backoffice', 'POST /auth/register', 201, 201);
  await grantGroups(admin, backofficeRaw, ['app-user', 'backoffice']);
  record('grant backoffice groups', 'PUT /users/{id}/groups', 200, 200);
  const backoffice = await reloginActor(backofficeRaw);

  // --- perfil do seller (register ja criou um; aqui exercitamos o PUT) ---
  const profile = await get<{ id: string }>(`/profiles/by-user/${seller.userId}`);
  record('get seller profile', 'GET /profiles/by-user/{userId}', 200, profile.status);

  const profileUpdate = await put(`/profiles/${profile.body.id}`, {
    token: seller.accessToken,
    body: { displayName: 'E2E Seller', bio: 'funnel run' },
  });
  record('update profile', 'PUT /profiles/{id}', 200, profileUpdate.status);

  // --- catalogo (backoffice) ---
  const categoryId = uniqueId('cat');
  const category = await post(`/categories`, {
    token: backoffice.accessToken,
    body: { id: categoryId, slug: categoryId, name: `Cat ${categoryId}`, synonyms: [`syn${Date.now()}`] },
  });
  record('create category', 'POST /categories', 201, category.status);

  const categoryUpdate = await put(`/categories/${categoryId}`, {
    token: backoffice.accessToken,
    body: { name: `Cat ${categoryId} v2` },
  });
  record('update category', 'PUT /categories/{id}', 200, categoryUpdate.status);

  const schema = await put(`/categories/${categoryId}/attribute-schema`, {
    token: backoffice.accessToken,
    body: {
      attributes: [
        {
          key: 'storage',
          name: 'Storage',
          valueType: 'STRING',
          required: false,
          filterable: true,
          facetOn: 'BOTH',
        },
      ],
    },
  });
  record('upsert attribute schema', 'PUT /categories/{id}/attribute-schema', 200, schema.status);

  const productId = uniqueId('prod');
  const product = await post(`/products`, {
    token: backoffice.accessToken,
    body: {
      id: productId,
      categoryId,
      brand: 'Sony',
      model: 'PS5 Digital',
      slug: productId,
      referencePriceCents: 350000,
      currency: 'BRL',
    },
  });
  record('create product', 'POST /products', 201, product.status);

  const productUpdate = await put(`/products/${productId}`, {
    token: backoffice.accessToken,
    body: { referencePriceCents: 340000 },
  });
  record('update product', 'PUT /products/{id}', 200, productUpdate.status);

  // --- media real no LocalStack ---
  const listingId = uniqueId('listing');
  const photoAssetId = await uploadMedia(seller, 'LISTING', seller.userId, 'image');
  const videoAssetId = await uploadMedia(seller, 'LISTING', seller.userId, 'video');

  // --- listing ---
  const uniqueToken = `E2EFunnel${Date.now()}`;
  const listing = await post(`/listings`, {
    token: seller.accessToken,
    body: {
      id: listingId,
      sellerId: seller.userId,
      productId,
      title: uniqueToken,
      condition: 'GOOD',
      priceCents: 320000,
      currency: 'BRL',
      media: { photoUrls: [], assetIds: [photoAssetId], videoAssetId },
      shipping: { modes: ['PICKUP'] },
    },
  });
  record('create listing', 'POST /listings', 201, listing.status,
    listing.status !== 201 ? JSON.stringify(listing.body).slice(0, 160) : undefined);
  if (listing.status !== 201) {
    throw new Error('cannot continue funnel without a listing');
  }

  const listingUpdate = await put(`/listings/${listingId}`, {
    token: seller.accessToken,
    body: { description: 'updated by funnel' },
  });
  record('update listing', 'PUT /listings/{id}', 200, listingUpdate.status);

  // --- submit -> [SQS] -> verification case ---
  const submit = await post(`/listings/${listingId}/submit`, { token: seller.accessToken });
  record('submit listing', 'POST /listings/{id}/submit', 200, submit.status);

  const openCase = await waitFor('verification case opened by async event', async () => {
    // Sem filtro na query: `listingId` nao esta declarado no OpenAPI desta rota e
    // `validateApiSpec: true` rejeita query params desconhecidos com 400.
    const list = await get<{ id: string; listingId: string; status: string }[]>(
      `/verification-cases`,
      { token: backoffice.accessToken },
    );
    if (list.status !== 200 || !Array.isArray(list.body)) return null;
    const match = list.body.filter((c) => c.listingId === listingId);
    return match.length > 0 ? match : null;
  });
  record('case opened via SQS', '[async] verification.case', 1, openCase.length,
    openCase.length === 1 ? 'idempotente apesar de 2 eventos' : 'DUPLICADO');

  await post(`/verification-cases/${openCase[0].id}/evidence`, {
    token: seller.accessToken,
    body: {
      id: uniqueId('fun-ph'),
      type: 'PHOTO',
      storageKey: 'private/evidence/funnel-photo.jpg',
    },
  });
  await post(`/verification-cases/${openCase[0].id}/evidence`, {
    token: seller.accessToken,
    body: {
      id: uniqueId('fun-vd'),
      type: 'VIDEO',
      storageKey: 'private/evidence/funnel-video.mp4',
    },
  });

  // --- assign + approve -> [SQS] -> auto-publish -> search ---
  const assign = await post(`/verification-cases/${openCase[0].id}/assign`, {
    token: backoffice.accessToken,
    body: { moderatorId: backoffice.userId },
  });
  record('assign reviewer', 'POST /verification-cases/{id}/assign', 200, assign.status);

  const approve = await post(`/verification-cases/${openCase[0].id}/approve`, {
    token: backoffice.accessToken,
    body: {},
  });
  record('approve case', 'POST /verification-cases/{id}/approve', 200, approve.status);

  const published = await waitFor('listing auto-published by async event', async () => {
    const l = await get<{ status: string }>(`/listings/${listingId}`);
    return l.status === 200 && l.body.status === 'PUBLISHED' ? l.body : null;
  });
  record('auto-publish via SQS', '[async] listing.status', 1, published.status === 'PUBLISHED' ? 1 : 0);

  const indexed = await waitFor('listing indexed in search', async () => {
    const s = await get<{ listingId: string; sealTypes?: string[] }[]>(`/search?q=${uniqueToken}`);
    if (s.status !== 200 || !Array.isArray(s.body)) return null;
    const hit = s.body.find((h) => h.listingId === listingId);
    return hit ?? null;
  });
  record('indexed in search via SQS', '[async] GET /search', 1, indexed ? 1 : 0);
  record('search doc sealTypes', '[artefato] sealTypes no indice', 1,
    (indexed.sealTypes ?? []).length,
    'esperado >0 se o seal entrasse antes do reindex');

  // --- favorito (buyer) ---
  const favoriteId = uniqueId('fav');
  const favorite = await post(`/favorites`, {
    token: buyer.accessToken,
    body: { id: favoriteId, userId: 'spoofed-other-user', targetType: 'LISTING', targetId: listingId },
  });
  record('create favorite', 'POST /favorites', 201, favorite.status);

  // --- trust ---
  const trustEvent = await post(`/trust-events`, {
    token: backoffice.accessToken,
    body: {
      id: uniqueId('te'),
      sellerId: seller.userId,
      type: 'ORDER_COMPLETED',
      sourceEventId: uniqueId('src'),
      payload: { orderId: 'e2e-order' },
    },
  });
  record('append trust event', 'POST /trust-events', 201, trustEvent.status);

  const recompute = await post(`/trust-scores/${seller.userId}/recompute`, {
    token: backoffice.accessToken,
  });
  record('recompute trust score', 'POST /trust-scores/{id}/recompute', 200, recompute.status);

  // --- reconcile + pause -> [SQS] -> sai do indice ---
  const reconcile = await post(`/search/reconcile`, { token: backoffice.accessToken });
  record('search reconcile', 'POST /search/reconcile', 200, reconcile.status);

  const pause = await post(`/listings/${listingId}/pause`, { token: seller.accessToken });
  record('pause listing', 'POST /listings/{id}/pause', 200, pause.status);

  const removed = await waitFor('listing removed from search index', async () => {
    const s = await get<{ listingId: string }[]>(`/search?q=${uniqueToken}`);
    if (s.status !== 200 || !Array.isArray(s.body)) return null;
    return s.body.some((h) => h.listingId === listingId) ? null : true;
  });
  record('removed from search via SQS', '[async] GET /search', 1, removed ? 1 : 0);

  const unfavorite = await del(`/favorites/${favoriteId}`, { token: buyer.accessToken });
  record('delete favorite', 'DELETE /favorites/{id}', 204, unfavorite.status);

  // --- resumo ---
  const failed = results.filter((r) => !r.ok);
  console.log(`\n=== ${results.length - failed.length}/${results.length} passos OK ===`);
  if (failed.length > 0) {
    console.log('\nFalhas:');
    failed.forEach((f) => console.log(`  - ${f.step}: esperado ${f.expected}, obtido ${f.got}${f.note ? ` (${f.note})` : ''}`));
  }
  console.log(`\nJSON:${JSON.stringify(results)}`);
  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('\nFUNIL ABORTADO:', error instanceof Error ? error.message : error);
  console.log(`\nJSON:${JSON.stringify(results)}`);
  process.exit(1);
});
