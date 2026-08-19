# Assign user groups (ADMIN only)

| | |
|--|--|
| **Domínio** | `identity` |
| **Tag OpenAPI** | Users |
| **Método** | `PUT` |
| **Path** | `/users/{id}/groups` |
| **Status sucesso** | `200` |
| **Autorização** | Bearer + group `admin` apenas. |

## O que este endpoint faz

ADMIN atribui papéis (app-user, backoffice, admin). Sem auto-escalada nem SYSTEM.

## Ganho no produto

ADMIN atribui papéis (app-user, backoffice, admin). Sem auto-escalada nem SYSTEM.

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
