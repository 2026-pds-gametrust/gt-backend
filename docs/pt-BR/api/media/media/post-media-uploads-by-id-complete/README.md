# Confirm the object arrived and start processing

| | |
|--|--|
| **Domínio** | `media` |
| **Tag OpenAPI** | Media |
| **Método** | `POST` |
| **Path** | `/media/uploads/{id}/complete` |
| **Status sucesso** | `200` |
| **Autorização** | Público — sem Authorization. Discovery e auth register/login/refresh (CEP exige Bearer). |

## O que este endpoint faz

Marks the upload as received and enqueues processing. Processing is **asynchronous**: the response normally carries `status: UPLOADED`, and the asset only becomes `READY` after the `media.asset.uploaded` event is consumed (variants generated and stored).
An asset can only be attached to a listing or product once it is `READY` — attaching an `UPLOADED` asset is rejected with 400. Clients must poll `GET /media/assets/{id}` until `status` is `READY` (or `FAILED`) before referencing the asset in `POST /listings` or `POST /products`.
The response may already show `READY` when in-process dispatch is enabled (`EVENT_INPROCESS_DISPATCH=true`, the default in tests), so clients must not rely on that timing.


## Ganho no produto

Confirma upload para processamento.

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
