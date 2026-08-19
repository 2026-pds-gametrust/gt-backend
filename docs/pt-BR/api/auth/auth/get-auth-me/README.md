# Return the authenticated public User

| | |
|--|--|
| **Domínio** | `auth` |
| **Tag OpenAPI** | Auth |
| **Método** | `GET` |
| **Path** | `/auth/me` |
| **Status sucesso** | `200` |
| **Autorização** | Bearer obrigatório (`Authorization: Bearer <accessToken>`). Qualquer group válido (`app-user`+). |

## O que este endpoint faz

Hidrata a sessão no app: User público do token (sem senha).

## Ganho no produto

Hidrata a sessão no app: User público do token (sem senha).

## Como se relaciona

- `POST /auth/register` → sessão inicial
- `POST /auth/login` → sessão existente
- `POST /auth/refresh` → renovar access
- `POST /auth/logout` → encerrar sessão
- `GET /auth/me` → hidratar User
- `POST /profiles` → perfil após conta
- `POST /listings` → vender (Bearer)

- Guia do módulo: [identity](../../../../modules/identity.md)
- Convenções HTTP: [http-conventions.md](../../../../architecture/http-conventions.md)

## Arquivos deste contrato

- [curl.sh](./curl.sh)
- [request.md](./request.md)
- [response.md](./response.md)
- [parameters.md](./parameters.md)
- [examples.md](./examples.md)
