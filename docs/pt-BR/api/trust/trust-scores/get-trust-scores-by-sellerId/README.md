# Get trust score for seller (default 0)

| | |
|--|--|
| **Domínio** | `trust` |
| **Tag OpenAPI** | Trust |
| **Método** | `GET` |
| **Path** | `/trust-scores/{sellerId}` |
| **Status sucesso** | `200` |
| **Autorização** | Público — sem Authorization. Discovery e auth register/login/refresh (CEP exige Bearer). |

## O que este endpoint faz

Score do vendedor na página do anúncio e perfil.

## Ganho no produto

Score do vendedor na página do anúncio e perfil.

## Como se relaciona

- `GET /listings/{id}` — PDP mostra score do `sellerId`
- `GET /seals` — selo da oferta, não do score
- Nunca reduzir TrustScore a cor sem motivo da API

- Guia do módulo: [trust](../../../../modules/trust.md)
- Convenções HTTP: [http-conventions.md](../../../../architecture/http-conventions.md)

## Arquivos deste contrato

- [curl.sh](./curl.sh)
- [request.md](./request.md)
- [response.md](./response.md)
- [parameters.md](./parameters.md)
- [examples.md](./examples.md)
