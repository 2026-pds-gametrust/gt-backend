# Add evidence metadata to a case

| | |
|--|--|
| **Domínio** | `verification` |
| **Tag OpenAPI** | Verification |
| **Método** | `POST` |
| **Path** | `/verification-cases/{caseId}/evidence` |
| **Status sucesso** | `201` |
| **Autorização** | Bearer obrigatório (`Authorization: Bearer <accessToken>`). Qualquer group válido (`app-user`+). |

## O que este endpoint faz

Requires access token; listing owner or BACKOFFICE/ADMIN.

## Ganho no produto

Evidências que sustentam o selo — auditabilidade.

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
