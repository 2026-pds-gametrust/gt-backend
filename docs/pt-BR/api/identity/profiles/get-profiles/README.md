# List profiles

| | |
|--|--|
| **Domínio** | `identity` |
| **Tag OpenAPI** | Profiles |
| **Método** | `GET` |
| **Path** | `/profiles` |
| **Status sucesso** | `200` |
| **Autorização** | Bearer + group `backoffice` ou `admin` (`authorizeByGroup`). |

## O que este endpoint faz

Perfil e endereços — apresentação do vendedor/entrega.

## Ganho no produto

Perfil e endereços — apresentação do vendedor/entrega.

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
