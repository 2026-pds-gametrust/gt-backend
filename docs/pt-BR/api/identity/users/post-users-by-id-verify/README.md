# Verify a user identity

| | |
|--|--|
| **Domínio** | `identity` |
| **Tag OpenAPI** | Users |
| **Método** | `POST` |
| **Path** | `/users/{id}/verify` |
| **Status sucesso** | `200` |
| **Autorização** | Bearer + group `backoffice` ou `admin` (`authorizeByGroup`). |

## O que este endpoint faz

ADMIN/BACKOFFICE marca identidade verificada — nunca fingir selo na UI só com esse flag.

## Ganho no produto

ADMIN/BACKOFFICE marca identidade verificada — nunca fingir selo na UI só com esse flag.

## Como se relaciona

- `POST /auth/register` — cadastro público (não use POST /users)
- `GET /auth/me` — User da sessão
- `PUT /users/{id}/groups` — papéis (ADMIN)

- Guia do módulo: [identity](../../../../modules/identity.md)
- Convenções HTTP: [http-conventions.md](../../../../architecture/http-conventions.md)

## Arquivos deste contrato

- [curl.sh](./curl.sh)
- [request.md](./request.md)
- [response.md](./response.md)
- [parameters.md](./parameters.md)
- [examples.md](./examples.md)
