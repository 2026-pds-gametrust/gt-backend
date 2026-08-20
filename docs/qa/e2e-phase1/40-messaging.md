---
feature: e2e-phase1-write-endpoints
status: DEFECTS_FOUND
version: 1.0.0
owner: QA
phase: "5 — Efeitos colaterais e mensageria"
---

# Fase 5 — Mensageria: contrato, nao-emissao, idempotencia, DLQ

**10/11 verificacoes OK.** A que falhou expos o defeito mais grave de toda a validacao.

Metodo: fila **espia** (`gt-local-spy`) assinada no mesmo topico e que ninguem consome,
permitindo inspecionar envelopes brutos sem interferir na app — e provar **nao**-emissao,
nao so emissao.

Executar:
```bash
export E2E_SPY_QUEUE_URL=<url da fila espia>
npx ts-node --transpile-only scripts/e2e/messaging.ts
```

## O que passou

| Verificacao | Resultado |
|---|---|
| Emissao | `catalog.category.created` chega na fila apos 201 |
| Contrato do envelope | `eventId`, `eventType`, `schemaVersion`, `occurredAt`, `aggregateId`, `producerModule`, `payload` todos presentes |
| Payload | bate com o contrato documentado (`categoryId`, `slug`, `name`, ...) |
| RawMessageDelivery | envelope puro, sem wrapper SNS (`Message`/`TopicArn` ausentes) |
| **Nao-emissao** | write que falha com **409 nao emite evento** |
| **Idempotencia de reentrega** | mesmo envelope reenviado 2x → `synonyms` 24 → 24, sem duplicacao |

## F13 · Uma mensagem malformada matava o consumer permanentemente — **CORRIGIDO**

`SqsEventConsumer.pollOnce()` (`src/infraestructure/messaging/sqs/sqs-event-consumer.ts:33-60`)
faz `JSON.parse(message.Body)` **sem try/catch**. O loop de `start()` e:

```ts
async start(): Promise<void> {
  this.running = true;
  while (this.running) {
    await this.pollOnce();   // excecao escapa do while
  }
}
```

Uma mensagem nao-parseavel lanca, a excecao escapa do `while`, `start()` rejeita e o
**loop de polling morre de vez**. `MessagingConsumersFactory` captura a rejeicao e loga
`sqs_consumer_error` — mas **nao reinicia** o consumer.

### Reproducao

```
1. enviar "{ isto nao e json valido" para gt-local-all-events
2. log: sqs_consumer_error ... SyntaxError: Expected property name or '}' in JSON
3. POST /categories -> 201  (HTTP continua normal)
4. aguardar 25s -> synonyms(deadcheck) = 0     <- evento nunca processado
5. fila principal acumulando: 2 mensagens
6. GET /health -> 200                          <- nenhum healthcheck detecta
```

Recuperacao **so** com restart do processo (confirmado: apos restart,
`synonyms(recovercheck) = 1`).

### Consequencias

1. **Parada total do processamento de eventos** a partir da primeira mensagem invalida.
   Todo o funil assincrono (abertura de case, auto-publish, indexacao no search,
   projecao de sinonimos, trust score) para em silencio funcional.
2. **A DLQ nunca e exercida.** Redrive exige `maxReceiveCount: 5` recebimentos, mas o
   consumer para no primeiro. A mensagem envenenada ficou com
   `ApproximateReceiveCount: 2` e a DLQ vazia — a rede de seguranca configurada em
   `bootstrap-messaging.sh` e inalcancavel na pratica.
3. **HTTP continua saudavel**, entao load balancer e healthcheck nao reciclam o processo.
   O sintoma aparece como "listings nao publicam" horas depois.

### Correcao sugerida

`try/catch` por mensagem em `pollOnce()`: logar e **nao deletar** a mensagem (deixando o
redrive contar ate a DLQ), e um `catch` no `while` de `start()` que registre e continue
o loop em vez de encerra-lo. Assim mensagem envenenada vai para a DLQ e o consumer
sobrevive.

Sem isso, a DLQ nao pode ser validada: qualquer teste de redrive esbarra no consumer morto.

## Correcao aplicada e validada

`src/infraestructure/messaging/sqs/sqs-event-consumer.ts`:

- `try/catch` **por mensagem** em `pollOnce()`: loga `sqs_message_error` e **nao deleta**,
  deixando o redrive contar ate a DLQ;
- `try/catch` no `while` de `start()`: loga `sqs_poll_error` e continua, com backoff de 5s
  para falha de broker;
- `queueUrl` ausente passa a falhar **antes** do loop (fail-fast em erro de configuracao,
  sem virar loop infinito).

### Redrive para DLQ — validado

Antes bloqueado pelo proprio F13; agora exercitado:

```
mensagem envenenada -> gt-local-all-events
  ... 5 recebimentos (VisibilityTimeout=1 para acelerar)
CHEGOU NA DLQ apos ~36s (n=1)
```

### Consumer sobrevive — validado

```
POST /categories -> 201
aguardar 14s -> synonyms(survivecheck) = 1     <- evento processado normalmente
log: sqs_message_error ... left for redrive (x5)
```

Ou seja: a mensagem envenenada vai para a DLQ **e** o processamento de eventos continua.

## Proximo

Fase 6 — regressao em Jest para F5-F13.
