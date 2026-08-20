# Confirm the object arrived and start processing

| | |
|--|--|
| **Domain** | `media` |
| **OpenAPI tag** | Media |
| **Method** | `POST` |
| **Path** | `/media/uploads/{id}/complete` |
| **Success status** | `200` |
| **Authorization** | Public — no Authorization. Discovery and auth register/login/refresh (not CEP). |

## What this endpoint does

Marks the upload as received and enqueues processing. Processing is **asynchronous**: the response normally carries `status: UPLOADED`, and the asset only becomes `READY` after the `media.asset.uploaded` event is consumed (variants generated and stored).
An asset can only be attached to a listing or product once it is `READY` — attaching an `UPLOADED` asset is rejected with 400. Clients must poll `GET /media/assets/{id}` until `status` is `READY` (or `FAILED`) before referencing the asset in `POST /listings` or `POST /products`.
The response may already show `READY` when in-process dispatch is enabled (`EVENT_INPROCESS_DISPATCH=true`, the default in tests), so clients must not rely on that timing.


## Product value

Confirms upload for processing.

## How it relates

- Use the asset `id` on `Listing.media` / evidence
- Display only when status is `READY`

- Module guide: [media](../../../../modules/media.md)
- HTTP conventions: [http-conventions.md](../../../../architecture/http-conventions.md)

## Files in this contract

- [curl.sh](./curl.sh)
- [request.md](./request.md)
- [response.md](./response.md)
- [parameters.md](./parameters.md)
- [examples.md](./examples.md)
