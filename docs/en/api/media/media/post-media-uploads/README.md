# Create a presigned image or listing video upload grant

| | |
|--|--|
| **Domain** | `media` |
| **OpenAPI tag** | Media |
| **Method** | `POST` |
| **Path** | `/media/uploads` |
| **Success status** | `201` |
| **Authorization** | Public — no Authorization. Discovery and auth register/login/refresh (not CEP). |

## What this endpoint does

Images (jpeg/png/webp) up to 10 MiB for PRODUCT, LISTING, EVIDENCE. Video (video/mp4) up to 50 MiB for LISTING only; processing publishes the original without transcoding.


## Product value

Upload grant (temporary URL) — do not invent media on the client.

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
