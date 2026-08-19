/**
 * Fase 5 — efeitos colaterais e mensageria.
 *
 * Usa uma fila "espia" (gt-local-spy) assinada no mesmo topico e que ninguem consome,
 * para inspecionar os envelopes brutos: emissao, contrato do payload e — o mais
 * importante — **nao**-emissao quando o write falha.
 */
import {
  SQSClient,
  ReceiveMessageCommand,
  PurgeQueueCommand,
  SendMessageCommand,
  GetQueueAttributesCommand,
  SetQueueAttributesCommand,
  GetQueueUrlCommand,
  QueueAttributeName,
} from '@aws-sdk/client-sqs';
import { get, post } from './client';
import { grantGroups, loginAdmin, registerActor, reloginActor, uniqueId } from './actors';

const ENDPOINT = process.env.AWS_ENDPOINT_URL || 'http://localhost:4566';
const sqs = new SQSClient({ region: 'us-east-1', endpoint: ENDPOINT });

const SPY = process.env.E2E_SPY_QUEUE_URL || '';
const MAIN_QUEUE = (process.env.SQS_CONSUMER_QUEUE_URLS || '').split(',')[0];

interface ICheck { name: string; ok: boolean; detail: string }
const checks: ICheck[] = [];

function check(name: string, ok: boolean, detail: string): void {
  checks.push({ name, ok, detail });
  console.log(`[${ok ? 'PASS' : 'FAIL'}] ${name.padEnd(52)} ${detail}`);
}

async function purge(queueUrl: string): Promise<void> {
  try {
    await sqs.send(new PurgeQueueCommand({ QueueUrl: queueUrl }));
  } catch {
    // purge tem cooldown de 60s; ignorar
  }
}

/** Drena a fila espia acumulando envelopes por ate `windowMs`. */
async function drainSpy(windowMs = 12000): Promise<Record<string, unknown>[]> {
  const deadline = Date.now() + windowMs;
  const envelopes: Record<string, unknown>[] = [];
  while (Date.now() < deadline) {
    const response = await sqs.send(
      new ReceiveMessageCommand({
        QueueUrl: SPY,
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 2,
        VisibilityTimeout: 30,
      }),
    );
    for (const message of response.Messages ?? []) {
      try {
        envelopes.push(JSON.parse(message.Body ?? '{}'));
      } catch {
        envelopes.push({ eventType: '<unparseable>', raw: message.Body });
      }
    }
    if (!response.Messages || response.Messages.length === 0) {
      if (envelopes.length > 0) break;
    }
  }
  return envelopes;
}

async function depth(queueUrl: string): Promise<number> {
  const attribute = QueueAttributeName.ApproximateNumberOfMessages;
  const r = await sqs.send(
    new GetQueueAttributesCommand({ QueueUrl: queueUrl, AttributeNames: [attribute] }),
  );
  return Number(r.Attributes?.[attribute] ?? '0');
}

async function main(): Promise<void> {
  console.log('=== Fase 5 — mensageria: contrato, nao-emissao, idempotencia, DLQ ===\n');
  if (!SPY) throw new Error('E2E_SPY_QUEUE_URL nao definido');

  const admin = await loginAdmin();
  const backofficeRaw = await registerActor('msg-bo');
  await grantGroups(admin, backofficeRaw, ['app-user', 'backoffice']);
  const backoffice = await reloginActor(backofficeRaw);
  const boToken = backoffice.accessToken;

  await purge(SPY);
  await new Promise((r) => setTimeout(r, 2000));

  // ---------------------------------------------------------- 1. emissao + contrato
  const slug = uniqueId('msg-cat');
  const created = await post('/categories', {
    token: boToken,
    body: { id: slug, slug, name: `Msg ${slug}`, synonyms: ['msgsyn'] },
  });
  check('write com sucesso responde 201', created.status === 201, `status=${created.status}`);

  const afterCreate = await drainSpy();
  const createdEvent = afterCreate.find(
    (e) => e.eventType === 'catalog.category.created',
  ) as Record<string, unknown> | undefined;

  check(
    'catalog.category.created emitido',
    Boolean(createdEvent),
    createdEvent ? 'presente na fila espia' : `nada; vistos: ${afterCreate.map((e) => e.eventType).join(',') || '(nenhum)'}`,
  );

  if (createdEvent) {
    const envelopeKeys = ['eventId', 'eventType', 'schemaVersion', 'occurredAt', 'aggregateId', 'producerModule', 'payload'];
    const missing = envelopeKeys.filter((k) => createdEvent[k] === undefined);
    check('envelope tem todos os campos do contrato', missing.length === 0,
      missing.length ? `faltando: ${missing.join(',')}` : envelopeKeys.join(', '));

    const payload = (createdEvent.payload ?? {}) as Record<string, unknown>;
    const payloadOk = payload.categoryId === slug && payload.slug === slug;
    check('payload bate com o contrato documentado', payloadOk,
      JSON.stringify(payload).slice(0, 120));

    check('RawMessageDelivery entrega o envelope, nao o wrapper SNS',
      createdEvent.Message === undefined && createdEvent.TopicArn === undefined,
      'sem chaves Message/TopicArn do SNS');
  }

  // ---------------------------------------------------------- 2. NAO-emissao em write que falha
  await purge(SPY);
  await new Promise((r) => setTimeout(r, 2000));

  const conflict = await post('/categories', {
    token: boToken,
    body: { id: uniqueId('other'), slug, name: `Dup ${slug}` },
  });
  check('write duplicado responde 409', conflict.status === 409, `status=${conflict.status}`);

  const notFound = await post('/trust-scores/does-not-exist-000/recompute', { token: boToken });
  check('recompute de seller inexistente', [200, 404].includes(notFound.status), `status=${notFound.status}`);

  const afterFailures = await drainSpy(10000);
  const leaked = afterFailures.filter((e) => e.eventType === 'catalog.category.created');
  check('write que falha (409) NAO emite evento', leaked.length === 0,
    leaked.length === 0 ? 'nenhum catalog.category.created' : `VAZOU ${leaked.length} evento(s)`);

  // ---------------------------------------------------------- 3. idempotencia de reentrega
  await purge(SPY);
  const beforeSynonyms = await get<unknown[]>('/synonyms');
  const beforeCount = Array.isArray(beforeSynonyms.body) ? beforeSynonyms.body.length : -1;

  if (createdEvent && MAIN_QUEUE) {
    // reentrega o MESMO envelope (mesmo eventId) direto na fila do consumer
    await sqs.send(new SendMessageCommand({ QueueUrl: MAIN_QUEUE, MessageBody: JSON.stringify(createdEvent) }));
    await sqs.send(new SendMessageCommand({ QueueUrl: MAIN_QUEUE, MessageBody: JSON.stringify(createdEvent) }));
    await new Promise((r) => setTimeout(r, 10000));

    const afterSynonyms = await get<unknown[]>('/synonyms');
    const afterCount = Array.isArray(afterSynonyms.body) ? afterSynonyms.body.length : -1;
    check('reentrega do mesmo evento nao duplica efeito', afterCount === beforeCount,
      `synonyms antes=${beforeCount} depois=${afterCount}`);
  }

  // ---------------------------------------------------------- 4. DLQ com mensagem envenenada
  const dlqUrl = (await sqs.send(new GetQueueUrlCommand({ QueueName: 'gt-local-all-events-dlq' }))).QueueUrl!;
  const dlqBefore = await depth(dlqUrl);

  // acelera a reentrega para nao esperar 5 x 30s
  await sqs.send(new SetQueueAttributesCommand({ QueueUrl: MAIN_QUEUE, Attributes: { VisibilityTimeout: '1' } }));
  await sqs.send(new SendMessageCommand({ QueueUrl: MAIN_QUEUE, MessageBody: '{ isto nao e json valido' }));
  console.log('  ... aguardando redrive (maxReceiveCount=5)');

  let dlqAfter = dlqBefore;
  for (let i = 0; i < 30; i += 1) {
    await new Promise((r) => setTimeout(r, 3000));
    dlqAfter = await depth(dlqUrl);
    if (dlqAfter > dlqBefore) break;
  }
  await sqs.send(new SetQueueAttributesCommand({ QueueUrl: MAIN_QUEUE, Attributes: { VisibilityTimeout: '30' } }));

  check('mensagem envenenada vai para a DLQ', dlqAfter > dlqBefore,
    `dlq antes=${dlqBefore} depois=${dlqAfter}`);

  const stillHealthy = await get('/health');
  check('app sobrevive a mensagem envenenada', stillHealthy.status === 200, `health=${stillHealthy.status}`);

  const failed = checks.filter((c) => !c.ok);
  console.log(`\n=== ${checks.length - failed.length}/${checks.length} verificacoes OK ===`);
  failed.forEach((f) => console.log(`  - ${f.name}: ${f.detail}`));
  process.exit(0);
}

main().catch((error) => {
  console.error('\nFASE 5 ABORTADA:', error instanceof Error ? error.message : error);
  process.exit(1);
});
