---
feature: e2e-phase1-write-endpoints
status: DEFECTS_FOUND
version: 1.0.0
owner: QA
phase: "3+4 — Matriz de erros e autorizacao"
---

# Fases 3 + 4 — Matriz de escrita: erros e autorizacao

**40/41 cenarios conforme esperado** apos as correcoes (era 34/40).
A unica divergencia restante e o F11, comportamento conhecido do pipeline de middleware.

Executar: `npx ts-node --transpile-only scripts/e2e/matrix.ts`
(limpe `db.auth_rate_limits.deleteMany({})` antes de reexecutar).

## O que passou

| Grupo | Resultado |
|---|---|
| 401 sem token | 10/11 rotas corretas |
| 403 grupo errado | 6/6 (`app-user` barrado em rota backoffice; backoffice barrado em `POST /users`) |
| Ownership / BOLA | 4/4 — usuario, perfil e listing alheios todos 403 |
| Spoof de header | `x-user-id` / `x-user-groups` forjados **nao** escalam privilegio |
| Mass assignment | campos extras (`id`, `createdAt`, `version`) ignorados no `PUT /categories` |
| NoSQL injection | `{"$ne":null}` no login → 400, sem bypass |
| PII | `GET /auth/me` nao vaza hash nem refresh token |
| 404 / 409 / 400 | conflito de slug, campo ausente e guard de PII corretos |

## Defeitos

### F8 · Status nao documentado virava 500 — **CORRIGIDO** (H1 confirmada)

`validateResponses: true` rejeita status ausente do spec e o handler
(`src/domain/server/server.ts:100-119`) converte em `500 {"message":"Internal Server Error"}`.

| Rota | Devia ser | Devolve | Log do validador |
|---|---|---|---|
| `POST /users/{id}/verify` (sem token) | 401 | **500** | `no schema defined for status code '401'` |
| `GET /profiles` (sem token) | 401 | **500** | `no schema defined for status code '401'` |
| `POST /verification-cases/{id}/reject` (inexistente) | 404 | **500** | `no schema defined for status code '404'` |
| `POST /seals/{id}/revoke` (inexistente) | 404 | **500** | `no schema defined for status code '404'` |

O cliente nao consegue distinguir "nao autenticado" de "servidor quebrado", e o 500
polui alarme de erro. Correcao aplicada: `401` declarado em `GET /profiles` e `POST /users/{id}/verify`;
`404` em `.../reject`, `/seals/{id}/revoke`, `POST /trust-events` e `.../recompute`.
Revalidado: os 4 respondem 401/401/404/404.

### F9 · `ValidationError` vs `TranslatedApiError` — **CORRIGIDO**

Dois schemas de erro incompativeis convivem no contrato:

- `ValidationError` (yaml:3894) — exige `message`, `status`, `errors`
- `TranslatedApiError` (yaml:2498) — exige `error`, `code` ← **o que a app realmente emite** via `handleTranslatedError`

Quatro rotas documentam `400: ValidationError`, entao **qualquer 400 de dominio nelas
vira 500**:

| Rota | Linha |
|---|---|
| `POST /users` | 1883 |
| `PUT /users/{id}` | 1969 |
| `POST /categories` | 213 |
| `POST /services` | 354 |

Reproduzido:
```
PUT /users/{id}  birthDate de menor  ->  500 {"message":"Internal Server Error"}
POST /users      birthDate de menor  ->  500
   log: .response.message should have required property 'message'
        .response.status  should have required property 'status'
        .response.errors  should have required property 'errors'
```
Controle — `POST /listings`, que documenta `TranslatedApiError`:
```
POST /listings  seller inexistente  ->  404 {"error":"Resource not found.","code":"RESOURCE_NOT_FOUND"}
```

**Nuance:** o 400 do *request validator* (campo obrigatorio ausente) funciona; so o 400
**de dominio** quebra. Por isso a suite atual nao pega — ela nao exercita 400 de dominio
nessas 4 rotas. Efeito pratico: `POST /users` e `PUT /users/{id}` **nao conseguem
recusar um menor de idade** com o status correto.

Correcao aplicada: `ValidationError` trocado por `TranslatedApiError` nos 400 de
`POST /users`, `PUT /users/{id}`, `POST /categories` e `POST /services`.
Revalidado: menor de idade agora responde **400**, nao 500.

### F10 · Writes publicos confirmados — **BLOCKING (decisao de produto)** (H2)

`POST /verification-cases` e `POST /verification-cases/{caseId}/evidence` respondem
**404** sem token nenhum — chegam ao service e falham por dado inexistente, nao por
autenticacao. Os services nao recebem `IActorContext`. Esta `security: []` no spec, logo
e deliberado, mas qualquer um na internet pode abrir caso de verificacao e anexar
evidencia. Precisa de decisao explicita do PO.

### F11 · 400 antes de 401 — **MEDIUM** (H4)

O OpenAPI validator roda antes de `requireAccessToken`, entao request anonimo com body
invalido recebe **400** em vez de 401, vazando a forma do schema a nao autenticados.
Confirmado em `POST /categories` e `POST /profiles`.

### F12 · `/media/*` responde 403 onde o resto responde 401 — **MEDIUM** (H3)

As 4 rotas de media nao tem guard de rota; `assertActorPresent`
(`src/domain/common/auth/actor-authorization.ts:26-34`) lanca **403**. Chamador anonimo
recebe 403 em media e 401 em todo o resto.

## Hipoteses descartadas

- **H5 — mass assignment:** `PUT /categories` com `id`, `createdAt` e `version` extras
  respondeu 200 e **ignorou** os campos protegidos. (Uma execucao acusou falso positivo
  por colisao de `name` — nome de categoria tambem e unico; corrigido no runner.) Apesar de nenhum schema PUT definir
  `additionalProperties: false` e de 4 handlers repassarem `req.body` direto, o service
  monta o payload campo a campo. Sem exposicao.
- **NoSQL injection:** operador Mongo no login → 400, sem bypass.
- **Spoof de header:** `attachActorFromAccessToken` apaga e rederiva do token; nao escala.

## Proximo

Fase 5 (DLQ e idempotencia sob falha) e Fase 6 (regressao em Jest para F5-F12).
