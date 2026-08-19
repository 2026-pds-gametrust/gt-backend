---
feature: e2e-phase1-write-endpoints
status: PASSED
version: 1.0.0
owner: QA
phase: "Cobertura — happy path dos 34"
---

# Cobertura — happy path dos 34 endpoints de escrita

**14/14 OK.** Fecha os 13 endpoints que as fases 2-5 nao tinham validado: 9 vistos so
em cenario de erro e 4 nunca tocados. Com isso, **34/34** dos POST/PUT tem happy path
confirmado contra a app real.

Executar: `npx ts-node --transpile-only scripts/e2e/coverage.ts`

## Validado aqui

| Endpoint | Status | Observacao |
|---|---|---|
| `POST /users` | 201 | ADMIN |
| `PUT /users/{id}` | 200 | ADMIN |
| `POST /users/{id}/verify` | 200 | backoffice |
| `POST /profiles` | 201 | usuario criado por `POST /users` **nao** tem profile (so `/auth/register` cria) |
| `POST /services` | 201 | backoffice |
| `PUT /services/{id}` | 200 | backoffice |
| `POST /listings/{id}/publish` | 200 | **rota HTTP direta** — no funil o publish acontece por evento |
| `POST /verification-cases` | 201 | **sem token** (write publico) |
| `POST /verification-cases/{caseId}/evidence` | 201 | **sem token**, com asset EVIDENCE READY |
| `POST /verification-cases/{id}/reject` | 200 | apos `assign` (nao sai de PENDING) |
| `POST /seals/{id}/revoke` | 200 | seal concedido pelo `approve` |
| `POST /auth/refresh` | 200 | rotacao de refresh token |
| `POST /auth/logout` | 204 | |
| `GET /auth/me` apos logout | 401 | revogacao de access token funciona |

## Detalhes de contrato descobertos

- **`Address` usa `recipientName` e `postalCode`** (nao `recipient`/`zipCode`) e exige
  `country`. Payload fora disso da 400 no OpenAPI.
- **`POST /users` nao cria profile.** Só `/auth/register` monta a cadeia
  user + credential + profile + sessao. Um usuario criado pela rota administrativa fica
  sem profile ate alguem chamar `POST /profiles`.
- **`reject` e `revoke` funcionam no happy path** — o 500 do F8 e exclusivo do caminho
  404 (recurso inexistente), nao do fluxo normal.

## Situacao dos defeitos apos esta rodada

F8 e F9 **nao afetam happy path**: os 4 endpoints envolvidos respondem certo com dados
validos. O impacto e restrito aos caminhos de erro:

- F8 — 401 sem token e 404 de recurso inexistente viram 500
- F9 — 400 de dominio (ex.: menor de idade) vira 500

Ou seja: a API funciona para o cliente que acerta; quebra o contrato para o que erra.
