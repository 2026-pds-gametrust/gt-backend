# Create a new user

| | |
|--|--|
| **Domínio** | `identity` |
| **Tag OpenAPI** | Users |
| **Método** | `POST` |
| **Path** | `/users` |
| **Status sucesso** | `201` |
| **Autorização** | Bearer + group `admin` apenas. |

## O que este endpoint faz

ADMIN only. Creates a marketplace User without a login credential.

## Ganho no produto

ADMIN cria User sem credencial (não é cadastro público). Lista BACKOFFICE/ADMIN.

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
