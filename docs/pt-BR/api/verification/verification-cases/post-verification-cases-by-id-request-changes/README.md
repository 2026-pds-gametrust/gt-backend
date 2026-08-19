# Request granular listing changes (backoffice)

| | |
|--|--|
| **Domínio** | `verification` |
| **Tag OpenAPI** | Verification |
| **Método** | `POST` |
| **Path** | `/verification-cases/{id}/request-changes` |
| **Status sucesso** | `200` |
| **Autorização** | Bearer obrigatório (`Authorization: Bearer <accessToken>`). Qualquer group válido (`app-user`+). |

## O que este endpoint faz

Pedir correções granulares (foto/vídeo/descrição) — listing volta a DRAFT para edição do vendedor.

## Ganho no produto

Pedir correções granulares (foto/vídeo/descrição) — listing volta a DRAFT para edição do vendedor.

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
