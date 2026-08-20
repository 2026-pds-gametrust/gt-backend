---
feature: e2e-phase1-write-endpoints
status: DEFECTS_FOUND
version: 1.0.0
owner: QA
---

# Validacao E2E dos endpoints de escrita — sumario

Os 34 endpoints de escrita (26 POST + 8 PUT) exercitados contra a **app real**:
Mongo e LocalStack do `docker-compose.yml`, S3 real, eventos por SNS→SQS
(`EVENT_INPROCESS_DISPATCH=false`), pilha de middleware completa.

Motivacao: a suite Jest tem 200 arquivos e ~99% de cobertura, mas roda com Mongo
in-memory, publisher SQS em **no-op** e dispatch in-process. Nenhum write jamais
tinha sido exercitado contra a app de verdade.

## Resultado

| Fase | Resultado |
|---|---|
| 0 — Ambiente | OK · [00-environment.md](00-environment.md) |
| 2 — Funil Phase 1 (HTTP) | **36/36** · [10-funnel.md](10-funnel.md) |
| 3+4 — Matriz erros/authz | **34/40** · [20-matrix-security.md](20-matrix-security.md) |
| Cobertura — happy path 34/34 | **14/14** · [30-coverage.md](30-coverage.md) |
| 5 — Mensageria | **10/11** · [40-messaging.md](40-messaging.md) |
| Frontend + backend | **17/17** · [50-frontend-e2e.md](50-frontend-e2e.md) |
| Cobertura backend→frontend | 68/68 clientes · [60-frontend-coverage.md](60-frontend-coverage.md) |

## Defeitos

| ID | Severidade | Resumo | Estado |
|---|---|---|---|
| F1 | BLOCKING | `seed-local.ts` quebrava contra banco limpo (faltava `videoUrl`) | **corrigido** |
| F2 | BLOCKING | Topologia do `bootstrap-messaging.sh` incompativel com o publisher | **corrigido** |
| F3 | BLOCKING | Subscriptions sem `RawMessageDelivery` — descarte silencioso | **corrigido** |
| F4 | MINOR | Bootstrap nao criava buckets S3 | **corrigido** |
| F8 | BLOCKING | 401/404 nao documentados viravam **500** em 4 rotas | **corrigido** |
| F9 | BLOCKING | `ValidationError` vs `TranslatedApiError`: 400 de dominio virava **500** em 4 rotas | **corrigido** |
| F10 | BLOCKING | 2 writes publicos sem auth nenhuma em `/verification-cases` | decisao do PO |
| F5 | BLOCKING | Media nao anexavel apos `complete` (`UPLOADED`, nao `READY`) | **contrato documentado**; comportamento inalterado |
| F6 | MEDIUM | `ListingMedia.photoUrls` obrigatorio inviabiliza o caminho de asset ids | aberto |
| F11 | MEDIUM | 400 antes de 401 vaza forma do schema a anonimos | aberto |
| F12 | MEDIUM | `/media/*` responde 403 onde o resto responde 401 | aberto |
| F13 | **BLOCKING** | Uma mensagem malformada matava o consumer SQS permanentemente; DLQ inalcancavel | **corrigido** |
| F15 | **BLOCKING** | Wizard de venda nao criava anuncio: sem midia, sem video, sem modo de envio | **corrigido** |
| F17 | **BLOCKING** | Grant de upload manda `Content-Length`; browser recusa e o PUT nunca sai | **corrigido** |
| F18 | **BLOCKING** | Buckets S3 sem CORS: upload pela web falha com "Network Error" | **corrigido** |
| F16 | MINOR | Rate limit de `/auth/*` derruba a suite Playwright paralela | contornavel |
| F14 | MEDIUM | CORS do backend nao cobre `127.0.0.1:5173`, que e o baseURL do Playwright | contornado no `.env.e2e` |
| F7 | MINOR | Query param nao declarado vira 400; sem filtro por listing | aberto |

**F2+F3 juntos significam que a mensageria via SQS, como estava scriptada, nunca
funcionou — e falhava em silencio**, sem erro em log algum.

## O que a suite Jest nao consegue pegar

F2, F3, F5 e F9 sao invisiveis para os testes atuais por construcao:

- com `NODE_ENV=test` o publisher SQS e **no-op** e o dispatch e in-process, entao
  topologia, `RawMessageDelivery` e latencia de processamento nunca sao exercitados;
- em dispatch in-process o `complete` de media ja re-le o asset como `READY`, escondendo
  a janela em que ele nao e anexavel (F5);
- a suite nao exercita 400 **de dominio** nas 4 rotas que documentam `ValidationError` (F9).

## Previsao minha que nao se confirmou

Eu havia previsto, lendo o codigo, que o `SearchDocument` nasceria com `sealTypes: []`
porque o auto-publish dispara o reindex antes de `grantSeal`. **Nao reproduziu sob SQS
real** — o indice veio com o seal. Sob async o caminho ate o reindex tem dois saltos de
fila, enquanto `grantSeal` roda sincrono dentro do `approveCase`, e a janela se fecha.
O artefato existe apenas no modo in-process, ou seja, no ambiente de teste.

Ja o duplo disparo do handler de verification (dois eventos por submit) manteve-se
idempotente: exatamente 1 case em todas as execucoes.

## Hipoteses descartadas

Mass assignment, NoSQL injection no login e spoof de header — todas testadas, nenhuma
exposta.

## Correcoes aplicadas em `src/`

| ID | Arquivo | Mudanca | Validacao |
|---|---|---|---|
| F13 | `src/infraestructure/messaging/sqs/sqs-event-consumer.ts` | try/catch por mensagem (deixa para redrive) + try/catch no loop de `start()` com backoff; `queueUrl` ausente falha antes do loop | DLQ recebe em ~36s **e** consumer sobrevive |
| F8 | `src/contracts/service.yaml` | `401` declarado em 2 rotas, `404` em 4 | os 4 respondem 401/401/404/404 |
| F9 | `src/contracts/service.yaml` | `ValidationError` → `TranslatedApiError` nos 400 de 4 rotas | menor de idade responde 400, nao 500 |
| F5 | `src/contracts/service.yaml` | `complete` documenta que o processamento e assincrono e que o cliente deve fazer polling ate `READY` antes de anexar | contrato explicito; **comportamento nao mudou** |

Regressao apos as correcoes: funil **36/36**, cobertura **14/14**, matriz **40/41**
(a unica divergencia e o F11, conhecido), Jest **200 suites / 902 testes** verdes.

## Pendente

- Fase 6: regressao em Jest para F5-F12; suites de authz que faltam em `catalog`,
  `trust`, `verification`, `media` e `search`.
- **Cobertura fechada: 34/34 endpoints de escrita com happy path validado.**
  O que resta e profundidade (combinacoes de payload), nao presenca.
