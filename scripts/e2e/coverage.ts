/**
 * Fecha a lacuna de cobertura: happy path dos 13 endpoints de escrita que as fases
 * 2-5 nao validaram — 9 que so tinham sido vistos em cenario de erro e 4 nunca tocados.
 */
import { get, post, put } from './client';
import {
  grantGroups,
  loginAdmin,
  registerActor,
  reloginActor,
  uniqueCpf,
  uniqueId,
} from './actors';
import { waitFor } from './poll';
import { createReadyListing, uploadReadyAsset } from './media';

interface IResult { endpoint: string; expected: number; got: number; ok: boolean; note?: string }
const results: IResult[] = [];

function record(endpoint: string, expected: number, got: number, note?: string): void {
  const ok = expected === got;
  results.push({ endpoint, expected, got, ok, note });
  console.log(`[${ok ? 'PASS' : 'FAIL'}] ${endpoint.padEnd(50)} exp=${expected} got=${got}${note ? ` — ${note}` : ''}`);
}

function birthDateYearsAgo(years: number): string {
  const now = new Date();
  return new Date(now.getFullYear() - years, now.getMonth(), now.getDate()).toISOString().slice(0, 10);
}

/** Espera o case aberto automaticamente pelo submit (via SQS). */
async function waitForCase(listingId: string, boToken: string): Promise<string> {
  const found = await waitFor(`case de ${listingId}`, async () => {
    const list = await get<{ id: string; listingId: string }[]>('/verification-cases', { token: boToken });
    if (list.status !== 200 || !Array.isArray(list.body)) return null;
    return list.body.find((c) => c.listingId === listingId) ?? null;
  });
  return found.id;
}

async function main(): Promise<void> {
  console.log('=== Cobertura: happy path dos 13 endpoints faltantes ===\n');

  const admin = await loginAdmin();
  const seller = await registerActor('cov-seller');
  const backofficeRaw = await registerActor('cov-bo');
  await grantGroups(admin, backofficeRaw, ['app-user', 'backoffice']);
  const backoffice = await reloginActor(backofficeRaw);
  const boToken = backoffice.accessToken;
  const adminToken = admin.accessToken;

  // ---------------------------------------------------- 1. POST /users (ADMIN)
  const newUserId = uniqueId('cov-user');
  const createUser = await post<{ id: string }>('/users', {
    token: adminToken,
    body: {
      id: newUserId,
      fullName: 'Coverage User',
      email: `${newUserId}@e2e.local`,
      phone: '11999990000',
      cpf: uniqueCpf(),
      birthDate: birthDateYearsAgo(30),
    },
  });
  record('POST /users', 201, createUser.status,
    createUser.status !== 201 ? JSON.stringify(createUser.body).slice(0, 120) : undefined);

  // ---------------------------------------------------- 2. PUT /users/{id} (ADMIN)
  const updateUser = await put('/users/' + newUserId, {
    token: adminToken,
    body: { fullName: 'Coverage User Renamed' },
  });
  record('PUT /users/{id}', 200, updateUser.status);

  // ---------------------------------------------------- 3. POST /users/{id}/verify
  const verify = await post(`/users/${newUserId}/verify`, { token: boToken });
  record('POST /users/{id}/verify', 200, verify.status);

  // ---------------------------------------------------- 4. POST /profiles
  // POST /users nao cria profile (so /auth/register cria), entao este usuario nao tem.
  const profileId = uniqueId('cov-prof');
  const addressId = uniqueId('addr');
  const createProfile = await post('/profiles', {
    token: adminToken,
    body: {
      id: profileId,
      userId: newUserId,
      displayName: 'Coverage Profile',
      addresses: [{
        id: addressId,
        recipientName: 'Coverage User',
        postalCode: '01310100',
        street: 'Avenida Paulista',
        number: '1000',
        district: 'Bela Vista',
        city: 'Sao Paulo',
        state: 'SP',
        country: 'BR',
      }],
      defaultShippingAddressId: addressId,
    },
  });
  record('POST /profiles', 201, createProfile.status,
    createProfile.status !== 201 ? JSON.stringify(createProfile.body).slice(0, 140) : undefined);

  // ---------------------------------------------------- 5-6. services
  const serviceId = uniqueId('cov-svc');
  const createService = await post('/services', {
    token: boToken,
    body: { id: serviceId, slug: serviceId, name: `Service ${serviceId}`, synonyms: [`svcsyn${Date.now()}`] },
  });
  record('POST /services', 201, createService.status);

  const updateService = await put(`/services/${serviceId}`, {
    token: boToken,
    body: { name: `Service ${serviceId} v2` },
  });
  record('PUT /services/{id}', 200, updateService.status);

  // ---------------------------------------------------- base de catalogo para listings
  const categoryId = uniqueId('cov-cat');
  await post('/categories', {
    token: boToken,
    body: { id: categoryId, slug: categoryId, name: `Cat ${categoryId}` },
  });
  const productId = uniqueId('cov-prod');
  await post('/products', {
    token: boToken,
    body: { id: productId, categoryId, brand: 'Sony', model: 'PS5', slug: productId },
  });

  // ---------------------------------------------------- 7. POST /listings/{id}/publish (rota HTTP direta)
  const listingPublish = await createReadyListing(seller, productId, `CovPublish${Date.now()}`);
  await post(`/listings/${listingPublish}/submit`, { token: seller.accessToken });
  const publish = await post(`/listings/${listingPublish}/publish`, { token: boToken });
  record('POST /listings/{id}/publish', 200, publish.status,
    publish.status !== 200 ? JSON.stringify(publish.body).slice(0, 140) : 'rota direta, nao via evento');

  // ---------------------------------------------------- 8. POST /verification-cases (write publico)
  const listingForCase = await createReadyListing(seller, productId, `CovCase${Date.now()}`);
  const manualCaseId = uniqueId('cov-case');
  const openCase = await post('/verification-cases', {
    body: { id: manualCaseId, listingId: listingForCase },
  });
  record('POST /verification-cases', 201, openCase.status, 'sem token (write publico)');

  // ---------------------------------------------------- 9. POST /verification-cases/{caseId}/evidence
  const evidenceAssetId = await uploadReadyAsset(seller, 'EVIDENCE', manualCaseId, 'image');
  const evidence = await post(`/verification-cases/${manualCaseId}/evidence`, {
    token: seller.accessToken,
    body: { id: uniqueId('cov-ev'), type: 'PHOTO', assetId: evidenceAssetId },
  });
  record('POST /verification-cases/{caseId}/evidence', 201, evidence.status, 'token do vendedor (owner)');

  // ---------------------------------------------------- 10. POST /verification-cases/{id}/reject
  const listingReject = await createReadyListing(seller, productId, `CovReject${Date.now()}`);
  await post(`/listings/${listingReject}/submit`, { token: seller.accessToken });
  const rejectCaseId = await waitForCase(listingReject, boToken);
  const rejectPhoto = await uploadReadyAsset(seller, 'EVIDENCE', rejectCaseId, 'image');
  const rejectVideo = await uploadReadyAsset(seller, 'EVIDENCE', rejectCaseId, 'video');
  await post(`/verification-cases/${rejectCaseId}/evidence`, {
    token: seller.accessToken,
    body: { id: uniqueId('rej-ph'), type: 'PHOTO', assetId: rejectPhoto },
  });
  await post(`/verification-cases/${rejectCaseId}/evidence`, {
    token: seller.accessToken,
    body: { id: uniqueId('rej-vd'), type: 'VIDEO', assetId: rejectVideo },
  });
  await post(`/verification-cases/${rejectCaseId}/assign`, {
    token: boToken,
    body: { moderatorId: backoffice.userId },
  });
  const reject = await post(`/verification-cases/${rejectCaseId}/reject`, {
    token: boToken,
    body: { reason: 'coverage run' },
  });
  record('POST /verification-cases/{id}/reject', 200, reject.status);

  // ---------------------------------------------------- 11. POST /seals/{id}/revoke
  const listingSeal = await createReadyListing(seller, productId, `CovSeal${Date.now()}`);
  await post(`/listings/${listingSeal}/submit`, { token: seller.accessToken });
  const sealCaseId = await waitForCase(listingSeal, boToken);
  const sealPhoto = await uploadReadyAsset(seller, 'EVIDENCE', sealCaseId, 'image');
  const sealVideo = await uploadReadyAsset(seller, 'EVIDENCE', sealCaseId, 'video');
  await post(`/verification-cases/${sealCaseId}/evidence`, {
    token: seller.accessToken,
    body: { id: uniqueId('seal-ph'), type: 'PHOTO', assetId: sealPhoto },
  });
  await post(`/verification-cases/${sealCaseId}/evidence`, {
    token: seller.accessToken,
    body: { id: uniqueId('seal-vd'), type: 'VIDEO', assetId: sealVideo },
  });
  await post(`/verification-cases/${sealCaseId}/assign`, {
    token: boToken,
    body: { moderatorId: backoffice.userId },
  });
  await post(`/verification-cases/${sealCaseId}/approve`, { token: boToken, body: {} });

  const seal = await waitFor('seal concedido pelo approve', async () => {
    const list = await get<{ id: string; status: string }[]>(`/seals?listingId=${listingSeal}`);
    if (list.status !== 200 || !Array.isArray(list.body)) return null;
    return list.body.find((s) => s.status === 'GRANTED') ?? null;
  });
  const revoke = await post(`/seals/${seal.id}/revoke`, {
    token: boToken,
    body: { sellerId: seller.userId },
  });
  record('POST /seals/{id}/revoke', 200, revoke.status);

  // ---------------------------------------------------- 12-13. auth refresh / logout
  const refreshActor = await registerActor('cov-refresh');
  const refresh = await post<{ accessToken: string }>('/auth/refresh', {
    body: { refreshToken: refreshActor.refreshToken },
  });
  record('POST /auth/refresh', 200, refresh.status);

  const logout = await post('/auth/logout', { token: refreshActor.accessToken });
  record('POST /auth/logout', 204, logout.status);

  const afterLogout = await get('/auth/me', { token: refreshActor.accessToken });
  record('GET /auth/me apos logout (revogacao)', 401, afterLogout.status, 'token invalidado');

  const failed = results.filter((r) => !r.ok);
  console.log(`\n=== ${results.length - failed.length}/${results.length} OK ===`);
  failed.forEach((f) => console.log(`  - ${f.endpoint}: esperado ${f.expected}, obtido ${f.got}${f.note ? ` — ${f.note}` : ''}`));
  process.exit(0);
}

main().catch((error) => {
  console.error('\nCOBERTURA ABORTADA:', error instanceof Error ? error.message : error);
  console.log(`parcial: ${results.filter((r) => r.ok).length}/${results.length} OK`);
  process.exit(1);
});
