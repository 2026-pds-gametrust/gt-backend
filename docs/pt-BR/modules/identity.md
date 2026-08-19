# Identidade e Auth

Conta, sessão, perfil e consulta de CEP. Convenções HTTP: [http-conventions](../architecture/http-conventions.md). API: [auth](../api/auth/) · [identity](../api/identity/). Inglês: [en](../../en/modules/identity.md).

Canon: [user](../../entities/user/) · [profile](../../entities/profile/). Linha do módulo: [ARCH-002](../../architecture/02-module-map.md).

## Papel

O **User** do marketplace guarda identidade (nome, email, CPF, …) e **não armazena senha**. Credenciais e sessões de refresh são collections à parte. **Profile** é apresentação e endereços de entrega.

O cadastro público cria User + credencial + group `app-user` e devolve tokens.

## Fluxos

```text
POST /auth/register  →  tokens
POST /auth/login     →  tokens
POST /auth/refresh   →  rotaciona refresh; reuso de token revogado derruba a família
POST /auth/logout    →  revoga esta sessão
GET  /auth/me        →  User do access token (sem senha)
POST /profiles       →  perfil após a conta (Bearer)
GET  /cep/{cep}      →  consulta de CEP (BrasilAPI; Bearer)
```

`POST /users` é **ADMIN** (User sem credencial). Não use para cadastro do app.

## Regras de produto

- Email/CPF duplicado no register → **400** uniforme (não 409). Não copiar “email já existe”.
- Login falho → **401** `AUTH_INVALID_CREDENTIALS` (sem enumerar email). BLOCKED não entra.
- PII GET/PUT/DELETE em `/users/{id}`: dono ou ADMIN (backoffice não basta).
- `POST /users/{id}/verify` é verificação de identidade backoffice/admin — nunca mostrar selo de anúncio só com esse flag.

## Eventos

Publish depois do persist ([mensageria](../architecture/messaging.md)). Payload de register/verify é só `{ userId }` — sem email/CPF.

| Evento | Quando | Consumer ligado |
|--------|--------|-----------------|
| `identity.user.registered` | Cadastro público / create user | ainda não (trust planejado) |
| `identity.user.verified` | Verify admin/backoffice | ainda não (trust planejado) |
| `identity.profile.updated` | Mutação de perfil | ainda não |

## Relacionados

- [Convenções HTTP](../architecture/http-conventions.md)
- [Comunicação](../architecture/communication.md)
- [Mensageria](../architecture/messaging.md)
- API: [auth](../api/auth/) · [identity](../api/identity/)
