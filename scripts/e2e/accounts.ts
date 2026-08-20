/**
 * Cria as contas que os specs Playwright do frontend-web esperam
 * (E2E_EMAIL / E2E_BACKOFFICE_EMAIL) e imprime os exports prontos.
 */
import { PASSWORD, grantGroups, loginAdmin, registerActor } from './actors';

async function main(): Promise<void> {
  const admin = await loginAdmin();
  console.log('admin autenticado');

  const member = await registerActor('e2e-member');
  console.log(`MEMBER     ${member.email}`);

  const backoffice = await registerActor('e2e-backoffice');
  await grantGroups(admin, backoffice, ['app-user', 'backoffice']);
  console.log(`BACKOFFICE ${backoffice.email} (grupo backoffice concedido)`);

  console.log('');
  console.log(`export E2E_EMAIL='${member.email}'`);
  console.log(`export E2E_PASSWORD='${PASSWORD}'`);
  console.log(`export E2E_BACKOFFICE_EMAIL='${backoffice.email}'`);
  console.log(`export E2E_BACKOFFICE_PASSWORD='${PASSWORD}'`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
