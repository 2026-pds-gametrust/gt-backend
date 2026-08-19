# Identity and Auth

Account, session, profile, and CEP lookup. HTTP conventions: [http-conventions](../architecture/http-conventions.md). API: [auth](../api/auth/) · [identity](../api/identity/). Portuguese: [pt-BR](../../pt-BR/modules/identity.md).

Canon: entity catalog [user](../../entities/user/) · [profile](../../entities/profile/). Module row: [ARCH-002](../../architecture/02-module-map.md).

## Role

Marketplace **User** holds identity (name, email, CPF, …) and **does not store a password**. Credentials and refresh sessions are separate collections. **Profile** is presentation and shipping addresses.

Public signup creates User + credential + `app-user` group and returns tokens.

## Flows

```text
POST /auth/register  →  tokens
POST /auth/login     →  tokens
POST /auth/refresh   →  rotate refresh; reuse of revoked token kills the family
POST /auth/logout    →  revoke this session
GET  /auth/me        →  User for the access token (no password)
POST /profiles       →  profile after account (Bearer)
GET  /cep/{cep}      →  postal lookup (BrasilAPI; Bearer)
```

`POST /users` is **ADMIN** (User without credential). Do not use it for app signup.

## Product rules

- Duplicate email/CPF on register → **400** uniform (not 409). Do not copy “email already exists”.
- Failed login → **401** `AUTH_INVALID_CREDENTIALS` (no email enumeration). BLOCKED users cannot sign in.
- PII GET/PUT/DELETE on `/users/{id}`: owner or ADMIN (backoffice is not enough).
- `POST /users/{id}/verify` is backoffice/admin identity verification — never show a listing seal from this flag alone.

## Events

Publish after persist ([messaging](../architecture/messaging.md)). Payload is `{ userId }` only on register/verify — no email/CPF.

| Event | When | Wired consumer |
|-------|------|----------------|
| `identity.user.registered` | Public register / user create | none yet (trust planned) |
| `identity.user.verified` | Admin/backoffice verify | none yet (trust planned) |
| `identity.profile.updated` | Profile mutation | none yet |

## Related

- [HTTP conventions](../architecture/http-conventions.md)
- [Communication](../architecture/communication.md)
- [Messaging](../architecture/messaging.md)
- API: [auth](../api/auth/) · [identity](../api/identity/)
