---
feature: e2e-phase1-write-endpoints
status: PASSED
version: 1.0.0
owner: QA
phase: "2 — Funil Phase 1 (HTTP)"
---

# Fase 2 — Funil Phase 1 ponta a ponta via HTTP

**36/36 passos OK.** Primeiro percurso do funil inteiro contra a app real: HTTP puro,
Mongo real, S3 no LocalStack e eventos atravessando SNS→SQS de verdade
(`EVENT_INPROCESS_DISPATCH=false`).

O funil Jest existente (`src/__tests__/integration/phase1/hardening-funnel.int.test.ts`)
chama services direto e so o `POST /favorites` passa por rota — este nao chama service
nenhum.

## Executar

```bash
docker compose up -d
bash scripts/localstack/bootstrap-messaging.sh
npx ts-node-dev --env-file=.env.e2e --respawn --transpile-only src/app.ts   # noutro shell
yarn seed:local                                                             # cria o ADMIN
npx ts-node --transpile-only scripts/e2e/funnel.ts
```

> `/auth/*` tem rate limit de 20 req / 15 min. Entre execucoes seguidas:
> `db.auth_rate_limits.deleteMany({})`.

## Cobertura

19 endpoints de escrita exercitados: `POST /auth/register|login`,
`PUT /users/{id}/groups`, `PUT /profiles/{id}`, `POST|PUT /categories`,
`PUT /categories/{id}/attribute-schema`, `POST|PUT /products`,
`POST /media/uploads`, `POST /media/uploads/{id}/complete`, `POST|PUT /listings`,
`POST /listings/{id}/submit|pause`, `POST /verification-cases/{id}/assign|approve`,
`POST /favorites`, `POST /trust-events`,
`POST /trust-scores/{id}/recompute`, `POST /search/reconcile`,
`DELETE /favorites/{id}`.

Transicoes assincronas validadas com polling: media `UPLOADED→READY`, abertura de
verification case, auto-publish, indexacao no search e remocao do indice no pause.
DLQ vazia ao final.

## Achados

### F5 · Media nao e anexavel logo apos o `complete` — **BLOCKING (contrato)**
`POST /media/uploads/{id}/complete` responde **200 com `status: UPLOADED`**, nao `READY`.
O `READY` so chega depois de `media.asset.uploaded` percorrer SNS→SQS→
`processUploadedAsset`. Como `assertAttachableAsset` exige `READY`, um cliente que faca
upload → complete → `POST /listings` **recebe 400**.

A suite Jest nao pega isso: com dispatch in-process o `complete` ja re-le o asset
como `READY`. E uma divergencia real entre teste e producao. O contrato nao expoe
nenhuma forma de o cliente saber quando pode anexar, alem de fazer polling em
`GET /media/assets/{id}`.

### F6 · `ListingMedia.photoUrls` obrigatorio inviabiliza o caminho de asset ids — **MEDIUM**
A descricao do schema diz "at least one resolved photo and one resolved video
(**via asset ids or legacy URLs**)", mas `required: [photoUrls]` e incondicional.
Usar so `assetIds` + `videoAssetId` da **400 no OpenAPI**, antes de chegar ao service.
Contornado com `photoUrls: []`. Ou o `required` sai, ou a descricao mente.

### F7 · Query param nao declarado vira 400 — **MINOR (documentacao)**
`GET /verification-cases?listingId=x` responde **400 FIELD_INVALID**: o parametro nao
existe no OpenAPI e `validateApiSpec: true` rejeita desconhecidos. A rota nao oferece
filtro por listing — quem consome precisa listar tudo e filtrar no cliente. Vale
declarar o filtro ou documentar a ausencia.

## Artefatos previstos que **nao** se confirmaram

**Ordenacao do `SearchDocument` no approve.** Previa (lendo o codigo) que o indice
nasceria com `sealTypes: []`, porque o auto-publish dispara o reindex antes de
`grantSeal` rodar. **Nao reproduziu sob SQS real**: o `GET /search` durante o run
devolveu o listing ja com `sealTypes` preenchido, e o seal `POSSESSION/GRANTED` existe.

Explicacao provavel: sob async o caminho ate o reindex tem **dois saltos** de fila
(`verification.case.approved` → listings → `listing.status_changed` → search),
enquanto `grantSeal` roda sincrono dentro do `approveCase`. A janela que existe em
dispatch in-process se fecha sozinha no caminho assincrono. **O artefato e do modo
in-process — ou seja, do ambiente de teste, nao de producao.**

**Duplo disparo do handler de verification.** O submit emite `listings.listing.status_changed`
**e** `listings.listing.submitted`, ambos roteados para `VerificationListingSubmittedHandler`.
Sob SQS real (sem ordem garantida) foi o cenario de maior risco do plano. Resultado:
**exatamente 1 case** em todas as execucoes. O re-read na race de 409 de
`ensureOpenCaseForListing` aguenta.

## Proximo

Fase 3 — matriz horizontal dos 34 POST/PUT (erros 400/401/403/404/409) e Fase 4 (authz).
