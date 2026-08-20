# Assign reviewer (backoffice)

| | |
|--|--|
| **Domínio** | `verification` |
| **Tag OpenAPI** | Verification |
| **Método** | `POST` |
| **Path** | `/verification-cases/{id}/assign` |
| **Status sucesso** | `200` |
| **Autorização** | Bearer + group `backoffice` ou `admin` (`authorizeByGroup`). |

## O que este endpoint faz

Atribui revisor (operação).

## Ganho no produto

Atribui revisor (operação).

## Como se relaciona

- `POST /listings/{id}/submit` abre o caso
- `POST .../approve` habilita publish
- UI: nunca mostrar selo sem `GRANTED`

- Guia do módulo: [verification](../../../../modules/verification.md)
- Convenções HTTP: [http-conventions.md](../../../../architecture/http-conventions.md)

## Arquivos deste contrato

- [curl.sh](./curl.sh)
- [request.md](./request.md)
- [response.md](./response.md)
- [parameters.md](./parameters.md)
- [examples.md](./examples.md)
