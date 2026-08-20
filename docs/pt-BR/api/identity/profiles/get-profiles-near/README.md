# Find profiles near a GeoJSON point

| | |
|--|--|
| **Domínio** | `identity` |
| **Tag OpenAPI** | Profiles |
| **Método** | `GET` |
| **Path** | `/profiles/near` |
| **Status sucesso** | `200` |
| **Autorização** | Bearer obrigatório (`Authorization: Bearer <accessToken>`). Qualquer group válido (`app-user`+). |

## O que este endpoint faz

Listagem geo de perfis próximos — discovery, não é selo de confiança.

## Ganho no produto

Listagem geo de perfis próximos — discovery, não é selo de confiança.

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
