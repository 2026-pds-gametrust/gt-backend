---
feature: e2e-phase1-write-endpoints
status: PASSED
version: 1.0.0
owner: QA
phase: "Frontend + backend ponta a ponta"
---

# Frontend conectado ao backend — ponta a ponta

**10/10 testes Playwright passando**, com o `frontend-web` (React 19 + Vite) rodando contra
o `gt-backend` real desta validacao — Mongo e LocalStack do compose, eventos por SNS/SQS.

## Como rodar

```bash
# 1. backend de pe (ver 00-environment.md)
npx ts-node-dev --env-file=.env.e2e --respawn --transpile-only src/app.ts

# 2. publica um anuncio e cria as contas; imprime os exports
npx ts-node --transpile-only scripts/e2e/seed-journey.ts

# 3. no frontend-web, com os exports colados no shell
cd ../frontend-web
export VITE_API_BASE_URL=http://localhost:3000
npx playwright test
```

O frontend ja faz fallback para `http://localhost:3000` quando `VITE_API_BASE_URL` nao
esta definido (`src/06-shared/lib/http/http-client.ts`), entao o export e redundante
neste setup — mas explicito.

## F14 · CORS nao cobre `127.0.0.1` — **MEDIUM**

`playwright.config.ts` usa `baseURL: http://127.0.0.1:5173`, e o default de
`CORS_ALLOWED_ORIGINS` no backend e `http://localhost:5173`. Sao origens distintas para
o browser.

```
OPTIONS /auth/login  Origin: http://127.0.0.1:5173
  -> HTTP 204, SEM Access-Control-Allow-Origin        <- browser bloqueia

OPTIONS /auth/login  Origin: http://localhost:5173
  -> HTTP 204, Access-Control-Allow-Origin: http://localhost:5173
```

O preflight responde **204 sem o header**, o que e pior que uma rejeicao explicita:
parece sucesso no nivel HTTP e falha so no browser, sem nada util no log do servidor.

Contornado no `.env.e2e` com
`CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173`. Vale alinhar o
default do backend com o `playwright.config.ts` do frontend, ou trocar o baseURL do
Playwright para `localhost`.

## Jornada completa (`e2e/journey.spec.ts`, novo)

Diferente dos specs existentes — que checam headings e redirects — cada asserção aqui
depende de dado que atravessou **frontend -> backend -> Mongo -> indice de busca ->
frontend**:

1. login real em `/entrar` (POST `/auth/login`)
2. `/buscar?q=<titulo>` devolve o anuncio vindo do indice do backend
3. clique abre `/anuncio/{id}` com o titulo no `h1`
4. **Favoritar** dispara `POST /favorites`; o botao vira "Remover dos favoritos"
   com `aria-pressed=true`
5. `/favoritos` le de volta do backend e mostra o anuncio
6. cleanup: desfavorita, deixando o ator no estado inicial

Mais um teste de reload direto pela URL do anuncio (sem passar pela busca).

### Evidencia no backend apos a jornada

| Verificacao | Resultado |
|---|---|
| `search_documents` do anuncio | presente, `status=PUBLISHED` |
| `GET /search?q=<titulo>` | devolve o anuncio |
| sessoes de refresh do member | 4 (logins reais do browser) |
| favoritos remanescentes | 0 (cleanup do teste funcionou) |

## F15 · O wizard de venda nao conseguia criar anuncio — **CORRIGIDO**

O fluxo principal do vendedor esta quebrado ponta a ponta. `POST /listings` responde
**400** e a UI mostra apenas `Falha ao enviar o anuncio.`.

`src/04-features/listings/api/listings-api.ts:80` (`submitListingDraft`) monta:

```ts
media: { photoUrls: draft.photoAssetIds ?? [] },   // vazio: o wizard nao tem upload
shipping: { modes: [] },                            // vazio: o wizard nao tem etapa de envio
// nenhum videoUrl / videoAssetId
```

O backend exige >=1 foto **e** um video (`assertCreateMediaReady`) mais
`shipping.modes` nao-vazio (invariante da entidade). Isolado com curl no backend real:

| Payload | Resultado |
|---|---|
| `photoUrls: []`, `modes: []` (o que o wizard manda) | **400** |
| `+ modes: ["PICKUP"]` | **400** |
| `+ 1 foto, sem video` | **400** |
| `+ foto + video + modes` | **201** |

Sao **tres** omissoes simultaneas, nao uma. O wizard tem 5 passos (identificar,
descrever, preco, evidencias, revisao) e **nenhum deles coleta midia ou modo de envio** —
ou seja, nao da para satisfazer o contrato so ajustando o payload: falta interface.

Alem disso, `media.photoUrls` recebe `photoAssetIds` — ids de asset num campo de URLs.
Ver F6 em [10-funnel.md](10-funnel.md): `ListingMedia` exige `photoUrls` mesmo quando se
usa `assetIds`, entao os dois lados estao confusos sobre esse campo.

### Correcao aplicada

| Arquivo | Mudanca |
|---|---|
| `05-entities/media-asset/model/index.ts` | `EMediaContentType.MP4` e `MEDIA_MAX_VIDEO_BYTE_SIZE` (50 MiB) — o enum so tinha imagens, entao video era impossivel |
| `04-features/media/api/media-api.ts` | `assertUploadable` aceita video com o teto proprio; `uploadAsset` (generico) com `uploadImage` delegando |
| `05-entities/listing/model/index.ts` | `IListingMedia.assetIds` e `videoAssetId` |
| `04-features/listings/api/listings-api.ts` | envia `assetIds` + `videoAssetId` + `shipping.modes`, e valida antes de chamar o backend com mensagem util |
| `04-features/sell-listing/model/use-sell-store.ts` | passo `MEDIA`, estado de fotos/video/entrega, `addPhoto` / `setVideo` / `toggleShippingMode`; `submit` propaga o motivo real do erro |
| `02-pages/sell/sell-page.tsx` | novo passo "Fotos e video" com upload e formas de entrega; "Continuar" so habilita com >=1 foto READY, video READY e um modo de entrega |

Cobertura: `e2e/sell-journey.spec.ts` percorre o wizard com upload real (fixtures em
`e2e/fixtures/`, geradas por `scripts/e2e/gen-fixtures.js` no backend) e exige um
**201 em POST /listings** — nao so a tela de sucesso.

### Evidencia no backend do anuncio criado pela UI

```
listing lst-1787107508072  status=SUBMITTED
media.assetIds     ["449a2a35-..."]
media.videoAssetId a93f6b75-...
media.photoUrls    ["http://localhost:4566/.../variants/card.webp"]   <- resolvido pelo backend
shipping.modes     ["PICKUP"]
verification case aberto: 1                                            <- via SQS
```

## F17 · Grant de upload manda `Content-Length`, que o browser proibe — **CORRIGIDO (frontend)**

`POST /media/uploads` devolve `upload.headers` com `Content-Length`. O browser recusa que
JavaScript defina esse header, entao o PUT presigned nunca saia:
`Refused to set unsafe header "Content-Length"`. Nada no backend indicava problema — o
201 do grant parecia saudavel.

Corrigido em `media-api.uploadBinary`, que filtra headers proibidos ao browser
(`content-length`, `host`, `connection`); o user agent os deriva do proprio request.
O backend segue mandando o header, que e legitimo para cliente server-side.

## F18 · Buckets S3 sem CORS — **CORRIGIDO (infra)**

Com o header resolvido, o PUT ainda falhava: os buckets nao tinham politica de CORS, e o
browser bloqueava a requisicao. Na app o sintoma era so `Network Error`.

`scripts/localstack/bootstrap-messaging.sh` passa a aplicar CORS
(`PUT`/`GET`/`HEAD`, origens de `CORS_ALLOWED_ORIGINS`) nos dois buckets. **O mesmo vale
em producao**: o bucket real precisa de CORS equivalente, senao o upload pela web quebra
do mesmo jeito.

### Por que a suite atual nao pegava

Nao havia teste do wizard. Os specs existentes cobrem descoberta publica e duas telas
autenticadas; nenhum exercita escrita pela UI.

## F16 · Rate limit derruba execucoes paralelas — **MINOR (operacional)**

`/auth/*` aceita 20 req / 15 min e o Playwright roda com 5 workers, cada um fazendo
login. Execucoes repetidas da suite completa esbarram em **429** e falham no
`signIn` com "unexpected value /entrar" — sintoma que nao sugere rate limit.

Contorno entre execucoes: `db.auth_rate_limits.deleteMany({})`. Alternativa melhor:
reusar `storageState` do Playwright em vez de logar por teste.

## Specs pre-existentes

Os 6 de `home.spec.ts` e `phase1-api.spec.ts` tambem passaram. Os blocos `authenticated`
e `backoffice` normalmente **pulam** por falta de credenciais; com as contas criadas por
`scripts/e2e/accounts.ts` eles rodaram de fato — inclusive a checagem de que um member
sem grupo backoffice ve "Sem permissao" em `/moderacao`.
