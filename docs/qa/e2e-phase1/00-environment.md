---
feature: e2e-phase1-write-endpoints
status: IN_PROGRESS
version: 0.1.0
owner: QA
phase: "0 — Environment"
---

# Fase 0 — Ambiente E2E

Valida os 34 endpoints de escrita (26 POST + 8 PUT) contra a **app real**, com Mongo e
LocalStack do `docker-compose.yml` — não a harness Jest in-memory.

## Estado verificado

| Item | Estado |
|---|---|
| Docker | 29.7.2 · daemon OK |
| `mongo:7` | `healthy`, replica set `rs0` (`rs.status().ok = 1`) |
| `localstack:4` | `s3`, `sns`, `sqs` available |
| Buckets S3 | `gt-media-public`, `gt-media-restricted` criados |
| App | `:3000` · `GET /health` → 200 · 1 consumer SQS ativo |
| Banco E2E | `gt-e2e` (isolado do banco de dev) |

## Config

`.env.e2e` (git-ignored; template redigido em `.env.e2e.example`). Chaves que **importam**:

```
NODE_ENV=development        # 'test' desliga o publisher SQS e forca S3 em memoria
S3_USE_MEMORY=false
S3_ENDPOINT=http://localhost:4566
SQS_CONSUMERS_ENABLED=true
EVENT_INPROCESS_DISPATCH=false   # forca o caminho assincrono real
SNS_TOPIC_ARN=arn:aws:sns:us-east-1:000000000000:gt-local-events
SQS_CONSUMER_QUEUE_URLS=.../gt-local-all-events
```

Subir:
```bash
docker compose up -d
npx ts-node-dev --env-file=.env.e2e --respawn --transpile-only src/app.ts
```
`yarn dev` **nao serve** — ele fixa `--env-file=.env`.

## Prova do caminho assincrono

Primeira vez que a cadeia SNS→SQS→consumer e exercitada neste repo (a suite Jest
tem o publisher em no-op e usa dispatch in-process).

`POST /categories` (201) → SNS `gt-local-events` → SQS `gt-local-all-events`
(raw delivery) → `TaxonomySynonymEventHandler` → 2 docs em `synonyms`
(`normalizedTerm: "async probe"` e `"asyncprobe"`, `targetType: CATEGORY`),
propagacao < 3s. Fila e DLQ drenadas (0/0).

> Nota de asserção: o campo é **`normalizedTerm`**, nao `term`.

## Achados da Fase 0

### F1 · `scripts/seed-local.ts` quebra contra banco limpo — **CORRIGIDO**
```
400 FIELD_INVALID — "A video is required to create a listing" (media.videoUrl)
```
O seed cria listing sem video, mas `assertCreateMediaReady` exige >=1 foto **e** video
(spec `docs/specs/listing-create-require-media`). Passava so em bancos que ja tinham o
listing de antes da regra. Onboarding novo esta quebrado.

### F2 · Topologia do `bootstrap-messaging.sh` incompativel com o publisher — **CORRIGIDO**
`SqsEventPublisher` publica em **um unico** `SNS_TOPIC_ARN`, usando `eventType` como
MessageAttribute (desenho de filter policy). O script cria **um topico por evento**
(`gt-local-catalog-category-created`, ...) e assina cada fila no seu proprio topico,
**sem filter policy**. As duas topologias nao se conversam: nenhuma combinacao de
`SNS_TOPIC_ARN` roteia os 10 eventos corretamente.

Contornado nesta validacao com um barramento unico (`gt-local-events` + fila
`gt-local-all-events`), coerente com o publisher e com o router — que ja despacha por
`eventType` e ignora tipos desconhecidos.

### F3 · Subscriptions sem `RawMessageDelivery` — **CORRIGIDO**
O script nao seta `RawMessageDelivery=true`. Sem isso o SNS embrulha a mensagem e o
consumer (`JSON.parse(Body)` → `handler.handle`) recebe o wrapper em vez do
`IEventEnvelope`; `envelope.eventType` fica `undefined` e o router **descarta em
silencio**. Falha sem erro nenhum no log.

### F4 · Bootstrap nao cria os buckets S3 — **CORRIGIDO**
So faz SNS/SQS. `gt-media-public` / `gt-media-restricted` (de `storage.env.ts`) ficam
faltando; media real falha ate criar na mao.

## Correcoes aplicadas

| ID | Arquivo | Mudanca |
|---|---|---|
| F1 | `scripts/seed-local.ts` | `media.videoUrl` adicionado ao listing semeado |
| F2 | `scripts/localstack/bootstrap-messaging.sh` | reescrito: barramento unico `gt-local-events` + fila `gt-local-all-events`, coerente com `SqsEventPublisher` |
| F3 | idem | `RawMessageDelivery=true` na subscription |
| F4 | idem | cria `gt-media-public` / `gt-media-restricted` (idempotente) |

### Validacao (banco `gt-e2e` zerado, bootstrap do zero)

`yarn seed:local` completa: create -> submit -> publish. Estado resultante:

| Colecao | Contagem | Origem |
|---|---|---|
| `verification_cases` | 1 (`PENDING`) | **evento assincrono** via SQS |
| `search_documents` | 1 (`PUBLISHED`) | **evento assincrono** via SQS |
| `listing_events` | 3 | created / submit / publish |
| `synonyms` | 3 | reconcile (sincrono) |

DLQ vazia. `yarn lint` limpo no diff.

**Idempotencia confirmada sob SQS real:** o submit emite *dois* eventos
(`listings.listing.status_changed` **e** `listings.listing.submitted`), ambos roteados
para `VerificationListingSubmittedHandler`, e mesmo assim so **um** case foi aberto —
o re-read na race de 409 de `ensureOpenCaseForListing` aguentou. Era o cenario de maior
risco do plano.

> Nomes de colecao sao **snake_case** (`verification_cases`, `search_documents`,
> `listing_events`, `price_history`), nao a pluralizacao padrao do Mongoose.

## Proximo

Fase 2 — funil Phase 1 ponta a ponta via HTTP.
