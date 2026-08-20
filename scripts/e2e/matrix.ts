/**
 * Fase 3 + 4 — matriz horizontal dos endpoints de escrita.
 *
 * Para cada POST/PUT: sem token, grupo errado, ownership (BOLA), 404, 409 e 400.
 * Cobre tambem as hipoteses H1-H5 do plano, que nenhum teste atual exercita.
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

interface ICase {
  group: string;
  name: string;
  endpoint: string;
  expected: number | number[];
  got: number;
  ok: boolean;
  note?: string;
}

const cases: ICase[] = [];

function check(
  group: string,
  name: string,
  endpoint: string,
  expected: number | number[],
  got: number,
  note?: string,
): void {
  const list = Array.isArray(expected) ? expected : [expected];
  const ok = list.includes(got);
  cases.push({ group, name, endpoint, expected, got, ok, note });
  console.log(
    `[${ok ? 'PASS' : 'FAIL'}] ${group.padEnd(12)} ${name.padEnd(44)} ${endpoint.padEnd(44)} exp=${list.join('|')} got=${got}${note ? ` — ${note}` : ''}`,
  );
}

async function main(): Promise<void> {
  console.log('=== Fase 3+4 — matriz de escrita: erros e autorizacao ===\n');

  const admin = await loginAdmin();
  const seller = await registerActor('mx-seller');
  const other = await registerActor('mx-other');
  const backofficeRaw = await registerActor('mx-backoffice');
  await grantGroups(admin, backofficeRaw, ['app-user', 'backoffice']);
  const backoffice = await reloginActor(backofficeRaw);

  const appUser = seller.accessToken;
  const boToken = backoffice.accessToken;
  const adminToken = admin.accessToken;
  const MISSING = 'does-not-exist-00000000';

  // ---------------------------------------------------------------- 401
  const noToken: [string, string, unknown][] = [
    ['POST', '/users', { id: uniqueId('u'), fullName: 'X Y', email: 'a@b.co', phone: '11999990000', cpf: uniqueCpf(), birthDate: '1990-01-01' }],
    ['PUT', `/users/${seller.userId}`, { fullName: 'Hacked Name' }],
    ['PUT', `/users/${seller.userId}/groups`, { groups: ['admin'] }],
    ['POST', '/profiles', { id: uniqueId('p'), userId: seller.userId, addresses: [], defaultShippingAddressId: 'x' }],
    ['POST', '/categories', { id: uniqueId('c'), slug: uniqueId('c'), name: 'X' }],
    ['POST', '/services', { id: uniqueId('s'), slug: uniqueId('s'), name: 'X' }],
    ['POST', '/products', { id: uniqueId('p'), categoryId: 'c', brand: 'B', model: 'M', slug: uniqueId('p') }],
    ['POST', '/listings', { id: uniqueId('l'), sellerId: seller.userId, productId: 'p', title: 'T', condition: 'GOOD', priceCents: 1000, media: { photoUrls: ['u'] }, shipping: { modes: ['PICKUP'] } }],
    ['POST', '/trust-events', { id: uniqueId('t'), sellerId: seller.userId, type: 'ORDER_COMPLETED', sourceEventId: uniqueId('s'), payload: {} }],
    ['POST', '/search/reconcile', undefined],
    ['POST', '/favorites', { id: uniqueId('f'), targetType: 'LISTING', targetId: 'x' }],
  ];
  for (const [method, path, body] of noToken) {
    const r = await (method === 'POST' ? post : put)(path, { body });
    check('401', `sem token: ${method} ${path.split('/')[1]}`, `${method} ${path}`, 401, r.status);
  }

  // /media/* checa so no service -> 403, nao 401 (H3)
  const mediaNoToken = await post('/media/uploads', {
    body: { purpose: 'LISTING', ownerId: seller.userId, contentType: 'image/jpeg', byteSize: 1000 },
  });
  check('H3', 'media sem token responde 403, nao 401', 'POST /media/uploads', 403, mediaNoToken.status,
    'inconsistencia de contrato vs resto da API');

  // ---------------------------------------------------------------- 403
  const wrongGroup: [string, string, unknown][] = [
    ['POST', '/categories', { id: uniqueId('c'), slug: uniqueId('c'), name: 'X' }],
    ['POST', '/services', { id: uniqueId('s'), slug: uniqueId('s'), name: 'X' }],
    ['POST', '/products', { id: uniqueId('p'), categoryId: 'c', brand: 'B', model: 'M', slug: uniqueId('p') }],
    ['POST', '/trust-events', { id: uniqueId('t'), sellerId: seller.userId, type: 'ORDER_COMPLETED', sourceEventId: uniqueId('s'), payload: {} }],
    ['POST', '/search/reconcile', undefined],
  ];
  for (const [method, path, body] of wrongGroup) {
    const r = await (method === 'POST' ? post : put)(path, { token: appUser, body });
    check('403', `app-user em rota backoffice: ${path}`, `${method} ${path}`, 403, r.status);
  }

  const userCreateAsBo = await post('/users', {
    token: boToken,
    body: { id: uniqueId('u'), fullName: 'X Y', email: `${uniqueId('e')}@b.co`, phone: '11999990000', cpf: uniqueCpf(), birthDate: '1990-01-01' },
  });
  check('403', 'backoffice em POST /users (so ADMIN)', 'POST /users', 403, userCreateAsBo.status);

  // ---------------------------------------------------------------- ownership / BOLA
  const bolaUser = await put(`/users/${other.userId}`, { token: appUser, body: { fullName: 'Owned By Attacker' } });
  check('BOLA', 'editar usuario alheio', 'PUT /users/{id}', 403, bolaUser.status);

  const otherProfile = await get<{ id: string }>(`/profiles/by-user/${other.userId}`);
  const bolaProfile = await put(`/profiles/${otherProfile.body.id}`, { token: appUser, body: { displayName: 'Owned' } });
  check('BOLA', 'editar perfil alheio', 'PUT /profiles/{id}', 403, bolaProfile.status);

  const bolaListing = await post('/listings', {
    token: appUser,
    body: { id: uniqueId('l'), sellerId: other.userId, productId: 'p', title: 'T', condition: 'GOOD', priceCents: 1000, media: { photoUrls: ['u'] }, shipping: { modes: ['PICKUP'] } },
  });
  check('BOLA', 'criar listing em nome de outro seller', 'POST /listings', 403, bolaListing.status);

  // backoffice NAO pode editar usuario (assertOwnerOrAdminOnly)
  const boEditsUser = await put(`/users/${other.userId}`, { token: boToken, body: { fullName: 'BO Edit' } });
  check('BOLA', 'backoffice editando usuario (owner-or-ADMIN)', 'PUT /users/{id}', 403, boEditsUser.status,
    'backoffice excluido de proposito');

  // ---------------------------------------------------------------- spoof de header (H4b)
  const spoof = await post('/categories', {
    token: appUser,
    headers: { 'x-user-id': admin.userId, 'x-user-groups': 'admin,backoffice' },
    body: { id: uniqueId('c'), slug: uniqueId('c'), name: 'Spoofed' },
  });
  check('spoof', 'x-user-groups forjado nao escala privilegio', 'POST /categories', 403, spoof.status);

  // ---------------------------------------------------------------- H1: 401/404 nao documentados
  const h1NoToken = await post(`/users/${seller.userId}/verify`, {});
  check('H1', '401 nao documentado em /users/{id}/verify', 'POST /users/{id}/verify', 401, h1NoToken.status,
    h1NoToken.status === 500 ? 'VIROU 500 (validateResponses)' : undefined);

  const h1Profiles = await get('/profiles', {});
  check('H1', '401 nao documentado em GET /profiles', 'GET /profiles', 401, h1Profiles.status,
    h1Profiles.status === 500 ? 'VIROU 500 (validateResponses)' : undefined);

  const h1Reject = await post(`/verification-cases/${MISSING}/reject`, { token: boToken, body: { reason: 'nope' } });
  check('H1', '404 nao documentado em /verification-cases/{id}/reject', 'POST .../reject', 404, h1Reject.status,
    h1Reject.status === 500 ? 'VIROU 500 (validateResponses)' : undefined);

  const h1Revoke = await post(`/seals/${MISSING}/revoke`, { token: boToken, body: { sellerId: seller.userId } });
  check('H1', '404 nao documentado em /seals/{id}/revoke', 'POST /seals/{id}/revoke', 404, h1Revoke.status,
    h1Revoke.status === 500 ? 'VIROU 500 (validateResponses)' : undefined);

  const h1Trust = await post('/trust-events', {
    token: boToken,
    body: { id: uniqueId('t'), sellerId: MISSING, type: 'ORDER_COMPLETED', sourceEventId: uniqueId('s'), payload: {} },
  });
  check('H1', '404 nao documentado em POST /trust-events', 'POST /trust-events', [201, 404], h1Trust.status,
    h1Trust.status === 500 ? 'VIROU 500 (validateResponses)' : undefined);

  // ---------------------------------------------------------------- H2: writes publicos
  const h2Case = await post('/verification-cases', { body: { id: uniqueId('vc'), listingId: MISSING } });
  check('H2', 'POST /verification-cases sem auth nenhuma', 'POST /verification-cases', [201, 404, 409], h2Case.status,
    h2Case.status !== 401 && h2Case.status !== 403 ? 'WRITE PUBLICO CONFIRMADO' : undefined);

  const h2Evidence = await post(`/verification-cases/${MISSING}/evidence`, {
    body: { id: uniqueId('ev'), type: 'PHOTO', storageKey: 'k' },
  });
  check('H2', 'POST .../evidence sem auth nenhuma', 'POST .../{caseId}/evidence', 401, h2Evidence.status,
    h2Evidence.status === 401 ? 'agora exige token (proof-code MVP)' : undefined);

  // ---------------------------------------------------------------- H4: 400 antes de 401
  const h4 = await post('/categories', { body: { slug: 123, name: null } });
  check('H4', 'body invalido sem token: 400 antes de 401', 'POST /categories', 400, h4.status,
    h4.status === 400 ? 'validator roda antes do guard — vaza forma do schema' : undefined);

  // ---------------------------------------------------------------- H5: mass assignment
  const massCatId = uniqueId('mass');
  // nome tambem precisa ser unico (regra de unicidade), senao o create colide com 409
  const massCreate = await post('/categories', {
    token: boToken,
    body: { id: massCatId, slug: massCatId, name: `Mass ${massCatId}` },
  });
  check('H5', 'setup: categoria criada para o teste', 'POST /categories', 201, massCreate.status);
  const mass = await put(`/categories/${massCatId}`, {
    token: boToken,
    body: { name: 'Mass v2', createdAt: '1999-01-01T00:00:00.000Z', id: 'hijacked-id', version: 999 },
  });
  const massRead = await get<{ id: string; createdAt: string }>(`/categories/${massCatId}`);
  const hijacked = massRead.body?.id !== massCatId || String(massRead.body?.createdAt).startsWith('1999');
  check('H5', 'mass assignment em PUT /categories', 'PUT /categories/{id}', 0, hijacked ? 1 : 0,
    hijacked ? 'CAMPO PROTEGIDO SOBRESCRITO' : `campos extras ignorados (put=${mass.status})`);

  // ---------------------------------------------------------------- NoSQL injection
  const nosql = await post('/auth/login', { body: { email: { $ne: null }, password: { $ne: null } } });
  check('nosql', 'operador Mongo no login', 'POST /auth/login', [400, 401], nosql.status,
    nosql.status === 200 ? 'BYPASS DE AUTENTICACAO' : undefined);

  // ---------------------------------------------------------------- 404 / 409 / 400 de dominio
  const notFound = await put(`/categories/${MISSING}`, { token: boToken, body: { name: 'X' } });
  check('404', 'atualizar categoria inexistente', 'PUT /categories/{id}', 404, notFound.status);

  const dupId = uniqueId('dup');
  await post('/categories', { token: boToken, body: { id: dupId, slug: dupId, name: `Dup ${dupId}` } });
  const conflict = await post('/categories', { token: boToken, body: { id: uniqueId('c'), slug: dupId, name: `Other ${dupId}` } });
  check('409', 'slug de categoria duplicado', 'POST /categories', 409, conflict.status);

  const badBody = await post('/categories', { token: boToken, body: { id: uniqueId('c'), name: 'sem slug' } });
  check('400', 'campo obrigatorio ausente', 'POST /categories', 400, badBody.status);

  const underage = await post('/users', {
    token: adminToken,
    body: { id: uniqueId('u'), fullName: 'Minor Person', email: `${uniqueId('e')}@b.co`, phone: '11999990000', cpf: uniqueCpf(), birthDate: new Date(Date.now() - 10 * 365 * 864e5).toISOString().slice(0, 10) },
  });
  check('400', 'usuario menor de idade', 'POST /users', 400, underage.status);

  const piiTrust = await post('/trust-events', {
    token: boToken,
    body: { id: uniqueId('t'), sellerId: seller.userId, type: 'ORDER_COMPLETED', sourceEventId: uniqueId('s'), payload: { cpf: '12345678901' } },
  });
  check('400', 'guard de PII em trust-events', 'POST /trust-events', 400, piiTrust.status);

  // ---------------------------------------------------------------- PII / secrets em resposta
  const meResponse = await get<Record<string, unknown>>('/auth/me', { token: appUser });
  const leaked = JSON.stringify(meResponse.body).match(/passwordHash|refreshToken|\$2[aby]\$/);
  check('PII', 'GET /auth/me nao vaza segredo', 'GET /auth/me', 0, leaked ? 1 : 0, leaked ? `VAZOU: ${leaked[0]}` : undefined);

  const otherUser = await get<Record<string, unknown>>(`/users/${other.userId}`, { token: appUser });
  check('PII', 'ler usuario alheio', 'GET /users/{id}', 403, otherUser.status);

  // ---------------------------------------------------------------- resumo
  const failed = cases.filter((c) => !c.ok);
  console.log(`\n=== ${cases.length - failed.length}/${cases.length} cenarios conforme esperado ===`);
  if (failed.length > 0) {
    console.log('\nDivergencias:');
    failed.forEach((f) =>
      console.log(`  - [${f.group}] ${f.name} (${f.endpoint}): esperado ${Array.isArray(f.expected) ? f.expected.join('|') : f.expected}, obtido ${f.got}${f.note ? ` — ${f.note}` : ''}`),
    );
  }
  process.exit(0);
}

main().catch((error) => {
  console.error('\nMATRIZ ABORTADA:', error instanceof Error ? error.message : error);
  process.exit(1);
});
