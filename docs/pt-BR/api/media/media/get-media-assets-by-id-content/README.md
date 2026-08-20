# Get a short-lived content grant

| | |
|--|--|
| **Domínio** | `media` |
| **Tag OpenAPI** | Media |
| **Método** | `GET` |
| **Path** | `/media/assets/{id}/content` |
| **Status sucesso** | `200` |
| **Autorização** | Público — sem Authorization. Discovery e auth register/login/refresh (CEP exige Bearer). |

## O que este endpoint faz

Grant de leitura do conteúdo.

## Ganho no produto

Grant de leitura do conteúdo.

## Como se relaciona

- Usar `id` do asset em `Listing.media` / evidência
- Só exibir quando status `READY`

- Guia do módulo: [media](../../../../modules/media.md)
- Convenções HTTP: [http-conventions.md](../../../../architecture/http-conventions.md)

## Arquivos deste contrato

- [curl.sh](./curl.sh)
- [request.md](./request.md)
- [response.md](./response.md)
- [parameters.md](./parameters.md)
- [examples.md](./examples.md)
