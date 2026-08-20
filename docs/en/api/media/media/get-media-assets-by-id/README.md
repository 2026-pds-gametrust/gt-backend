# Get media asset metadata

| | |
|--|--|
| **Domain** | `media` |
| **OpenAPI tag** | Media |
| **Method** | `GET` |
| **Path** | `/media/assets/{id}` |
| **Success status** | `200` |
| **Authorization** | Public — no Authorization. Discovery and auth register/login/refresh (not CEP). |

## What this endpoint does

Asset metadata (status READY before display).

## Product value

Asset metadata (status READY before display).

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
