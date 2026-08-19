# HTTP conventions

Rules that apply to **every** endpoint. Generated contracts: [API index](../api/README.md). Portuguese: [pt-BR](../../pt-BR/architecture/http-conventions.md).

Source of truth for paths and schemas: [`src/contracts/service.yaml`](../../../src/contracts/service.yaml).

## Base URL (local)

`http://localhost:3000` (or `PORT` from `.env`). Health: `GET /health` (not part of the OpenAPI marketplace tags).

## Authorization

Every operation has an explicit decision in OpenAPI `security` and in `initRoutes()` via `authorizeByGroup`.

| Kind | Meaning |
|------|---------|
| Public | `security: []` — discovery, `POST /auth/register`, login, refresh |
| Bearer | `Authorization: Bearer <accessToken>` — any valid group (`app-user`+) |
| Backoffice | Bearer + `backoffice` or `admin` |
| Admin | Bearer + `admin` only |
| Owner or admin | Bearer + resource owner **or** `admin` (backoffice is not enough for User PII) |

Identity comes **only** from the access JWT. Do not send `x-user-id` / `x-user-groups` as identity; the backend must not trust client-sent actor headers.

Public signup is **`POST /auth/register`**. `POST /users` is ADMIN (creates a User without credentials).

## Errors

Controllers use `handleTranslatedError` + `EErrorCode`. Clients should key off `code`, not raw `message`.

Typical HTTP:

| Status | When |
|--------|------|
| 400 | Validation, underage, uniform register collision (do not treat as “email already exists” in copy) |
| 401 | Missing/invalid/expired access token; invalid login credentials (no email enumeration) |
| 403 | Authenticated but not allowed |
| 404 | Resource missing (Service decision, not Repository) |
| 409 | Conflict (uniqueness, illegal state transition) |
| 429 | Rate limit |
| 500 | `DATABASE_ERROR` / unexpected — no stack in the body |

On 401: try `POST /auth/refresh`; if that fails, send the user to login.

## Pagination and payloads

List endpoints are paginated with an enforced maximum. Do not expect internal Mongo fields. Build write payloads field-by-field from the OpenAPI schema (no mass assignment of `req.body`).

## Product rules on the wire

1. **Trust > volume** — show a seal only when the API returns a granted/active seal.
2. **Product ≠ Listing** — `/products` = model; `/listings` = unit/offer.
3. **AI does not invent** — form fields come from `attribute-schema` and responses.
4. **TrustScore with reasons** — use returned events/score; do not reduce trust to a color.

## Documenting a new operation

See [contributing](../contributing.md). After YAML + code: `yarn docs:api`.
