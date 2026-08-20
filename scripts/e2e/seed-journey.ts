/**
 * Publica um anuncio com titulo unico para a jornada Playwright do frontend-web,
 * e imprime os exports que o spec consome.
 */
import { get, post } from './client';
import { PASSWORD, grantGroups, loginAdmin, registerActor, reloginActor, uniqueId } from './actors';
import { createReadyListing } from './media';
import { waitFor } from './poll';

async function main(): Promise<void> {
  const admin = await loginAdmin();
  const backofficeRaw = await registerActor('journey-bo');
  await grantGroups(admin, backofficeRaw, ['app-user', 'backoffice']);
  const backoffice = await reloginActor(backofficeRaw);

  const seller = await registerActor('journey-seller');
  const member = await registerActor('journey-member');

  const categoryId = uniqueId('journey-cat');
  await post('/categories', {
    token: backoffice.accessToken,
    body: { id: categoryId, slug: categoryId, name: `Journey ${categoryId}` },
  });
  const productId = uniqueId('journey-prod');
  await post('/products', {
    token: backoffice.accessToken,
    body: { id: productId, categoryId, brand: 'NVIDIA', model: 'RTX 4090', slug: productId },
  });

  const title = `JourneyRTX${Date.now()}`;
  const listingId = await createReadyListing(seller, productId, title);
  await post(`/listings/${listingId}/submit`, { token: seller.accessToken });
  const publish = await post(`/listings/${listingId}/publish`, { token: backoffice.accessToken });
  if (publish.status !== 200) {
    throw new Error(`publish falhou: ${publish.status} ${JSON.stringify(publish.body)}`);
  }

  // o indice do search e alimentado por evento; espera ficar consultavel
  await waitFor('anuncio indexado no search', async () => {
    const s = await get<{ listingId: string }[]>(`/search?q=${title}`);
    if (s.status !== 200 || !Array.isArray(s.body)) return null;
    return s.body.find((h) => h.listingId === listingId) ?? null;
  });

  console.log(`anuncio publicado e indexado: ${listingId} ("${title}")`);
  console.log('');
  console.log(`export E2E_EMAIL='${member.email}'`);
  console.log(`export E2E_PASSWORD='${PASSWORD}'`);
  console.log(`export E2E_BACKOFFICE_EMAIL='${backoffice.email}'`);
  console.log(`export E2E_BACKOFFICE_PASSWORD='${PASSWORD}'`);
  console.log(`export E2E_LISTING_TITLE='${title}'`);
  console.log(`export E2E_LISTING_ID='${listingId}'`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
