# Append trust event (backoffice)

| | |
|--|--|
| **Domínio** | `trust` |
| **Tag OpenAPI** | Trust |
| **Método** | `POST` |
| **Path** | `/trust-events` |
| **Status sucesso** | `201` |
| **Autorização** | Bearer + group `backoffice` ou `admin` (`authorizeByGroup`). |

## O que este endpoint faz

Ledger de eventos que alimentam o score (explicabilidade).

## Ganho no produto

Ledger de eventos que alimentam o score (explicabilidade).

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
