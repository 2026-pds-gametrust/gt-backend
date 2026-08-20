# Get profile by user id

| | |
|--|--|
| **Domínio** | `identity` |
| **Tag OpenAPI** | Profiles |
| **Método** | `GET` |
| **Path** | `/profiles/by-user/{userId}` |
| **Status sucesso** | `200` |
| **Autorização** | Público — sem Authorization. Discovery e auth register/login/refresh (CEP exige Bearer). |

## O que este endpoint faz

Lookup de perfil por userId — seller page e checkout futuro.

## Ganho no produto

Lookup de perfil por userId — seller page e checkout futuro.

## Como se relaciona

- `POST /auth/register` — conta antes do perfil
- `GET /profiles/by-user/{userId}` — seller page
- `POST /listings` — vender exige perfil/conta

- Guia do módulo: [identity](../../../../modules/identity.md)
- Convenções HTTP: [http-conventions.md](../../../../architecture/http-conventions.md)

## Arquivos deste contrato

- [curl.sh](./curl.sh)
- [request.md](./request.md)
- [response.md](./response.md)
- [parameters.md](./parameters.md)
- [examples.md](./examples.md)
