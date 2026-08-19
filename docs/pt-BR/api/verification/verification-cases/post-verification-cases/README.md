# Open verification case for listing

| | |
|--|--|
| **Domínio** | `verification` |
| **Tag OpenAPI** | Verification |
| **Método** | `POST` |
| **Path** | `/verification-cases` |
| **Status sucesso** | `201` |
| **Autorização** | Público — sem Authorization. Discovery e auth register/login/refresh (CEP exige Bearer). |

## O que este endpoint faz

Fila de moderação com filtros, busca e score IA — revisão backoffice.

## Ganho no produto

Fila de moderação com filtros, busca e score IA — revisão backoffice.

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
