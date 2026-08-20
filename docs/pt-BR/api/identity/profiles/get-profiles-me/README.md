# Get authenticated user's own profile (owner projection)

| | |
|--|--|
| **Domínio** | `identity` |
| **Tag OpenAPI** | Profiles |
| **Método** | `GET` |
| **Path** | `/profiles/me` |
| **Status sucesso** | `200` |
| **Autorização** | Bearer obrigatório (`Authorization: Bearer <accessToken>`). Qualquer group válido (`app-user`+). |

## O que este endpoint faz

Identidade e perfil ancoram ownership, verificação de conta e endereços — pré-requisito de confiança. Conta de marketplace (User) não guarda senha; sessão vem de /auth/*.

## Ganho no produto

Identidade e perfil ancoram ownership, verificação de conta e endereços — pré-requisito de confiança. Conta de marketplace (User) não guarda senha; sessão vem de /auth/*.

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
