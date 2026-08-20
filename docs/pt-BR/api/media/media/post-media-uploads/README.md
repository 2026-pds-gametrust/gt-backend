# Create a presigned image or listing video upload grant

| | |
|--|--|
| **Domínio** | `media` |
| **Tag OpenAPI** | Media |
| **Método** | `POST` |
| **Path** | `/media/uploads` |
| **Status sucesso** | `201` |
| **Autorização** | Público — sem Authorization. Discovery e auth register/login/refresh (CEP exige Bearer). |

## O que este endpoint faz

Images (jpeg/png/webp) up to 10 MiB for PRODUCT, LISTING, EVIDENCE. Video (video/mp4) up to 50 MiB for LISTING only; processing publishes the original without transcoding.


## Ganho no produto

Grant de upload (URL temporária) — não inventar mídia no front.

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
