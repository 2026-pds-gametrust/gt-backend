# Convenções HTTP

Regras de **todo** endpoint. Contratos gerados: [índice da API](../api/README.md). Inglês: [en](../../en/architecture/http-conventions.md).

Fonte de verdade de paths e schemas: [`src/contracts/service.yaml`](../../../src/contracts/service.yaml).

## Base URL (local)

`http://localhost:3000` (ou `PORT` do `.env`). Health: `GET /health` (fora das tags de marketplace do OpenAPI).

## Autorização

Toda operação tem decisão explícita no OpenAPI `security` e em `initRoutes()` via `authorizeByGroup`.

| Tipo | Significado |
|------|-------------|
| Público | `security: []` — discovery, `POST /auth/register`, login, refresh |
| Bearer | `Authorization: Bearer <accessToken>` — qualquer group válido (`app-user`+) |
| Backoffice | Bearer + `backoffice` ou `admin` |
| Admin | Bearer + só `admin` |
| Dono ou admin | Bearer + dono do recurso **ou** `admin` (backoffice não basta para PII de User) |

Identidade vem **somente** do JWT de acesso. Não envie `x-user-id` / `x-user-groups` como identidade; o backend não deve confiar nesses headers do cliente.

Cadastro público é **`POST /auth/register`**. `POST /users` é ADMIN (User sem credencial).

## Erros

Controllers usam `handleTranslatedError` + `EErrorCode`. O cliente deve usar `code`, não a `message` crua.

HTTP típico:

| Status | Quando |
|--------|--------|
| 400 | Validação, menor de idade, colisão uniforme no register (não tratar na copy como “email já existe”) |
| 401 | Access ausente/inválido/expirado; credenciais de login inválidas (sem enumerar email) |
| 403 | Autenticado sem permissão |
| 404 | Recurso inexistente (decisão do Service, não do Repository) |
| 409 | Conflito (unicidade, transição ilegal) |
| 429 | Rate limit |
| 500 | `DATABASE_ERROR` / inesperado — sem stack no body |

Em 401: tentar `POST /auth/refresh`; se falhar, ir para o login.

## Paginação e payloads

Listagens são paginadas com máximo imposto. Não espere campos internos do Mongo. Monte o body campo a campo a partir do schema OpenAPI (sem mass assignment de `req.body`).

## Regras de produto no fio

1. **Confiança > volume** — mostre selo só quando a API devolver selo concedido/ativo.
2. **Produto ≠ Oferta** — `/products` = modelo; `/listings` = unidade/oferta.
3. **IA não inventa** — campos do form vêm de `attribute-schema` e das respostas.
4. **TrustScore com motivos** — use eventos/score retornados; não reduza confiança a uma cor.

## Documentar uma operação nova

Ver [contribuir](../contributing.md). Depois do YAML + código: `yarn docs:api`.
