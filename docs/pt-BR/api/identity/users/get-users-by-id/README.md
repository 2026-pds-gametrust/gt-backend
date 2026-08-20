# Get a user by ID

| | |
|--|--|
| **Domínio** | `identity` |
| **Tag OpenAPI** | Users |
| **Método** | `GET` |
| **Path** | `/users/{id}` |
| **Status sucesso** | `200` |
| **Autorização** | Bearer + dono do recurso **ou** `admin` (BACKOFFICE não basta em PII de User). |

## O que este endpoint faz

Retrieve a user by their unique ID. Owner or ADMIN.

## Ganho no produto

PII: GET/PUT/DELETE só dono ou ADMIN. PUT do dono não grava verified/status.

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
