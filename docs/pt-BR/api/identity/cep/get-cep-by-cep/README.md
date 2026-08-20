# Lookup Brazilian postal code via BrasilAPI

| | |
|--|--|
| **Domínio** | `identity` |
| **Tag OpenAPI** | CEP |
| **Método** | `GET` |
| **Path** | `/cep/{cep}` |
| **Status sucesso** | `200` |
| **Autorização** | Bearer obrigatório (`Authorization: Bearer <accessToken>`). Qualquer group válido (`app-user`+). |

## O que este endpoint faz

Consulta de CEP (BrasilAPI) para formulários de endereço (Bearer).

## Ganho no produto

Consulta de CEP (BrasilAPI) para formulários de endereço (Bearer).

## Como se relaciona

- Usar em formulários de endereço após `POST /auth/register` (Bearer)
- `POST /profiles` guarda o endereço resolvido

- Guia do módulo: [identity](../../../../modules/identity.md)
- Convenções HTTP: [http-conventions.md](../../../../architecture/http-conventions.md)

## Arquivos deste contrato

- [curl.sh](./curl.sh)
- [request.md](./request.md)
- [response.md](./response.md)
- [parameters.md](./parameters.md)
- [examples.md](./examples.md)
