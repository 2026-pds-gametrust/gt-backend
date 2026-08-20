# Recurso: media

Domínio: `media`

| Método | Path | Contrato |
|--------|------|----------|
| `GET` | `/media/assets/{id}` | [Get media asset metadata](./get-media-assets-by-id/) |
| `GET` | `/media/assets/{id}/content` | [Get a short-lived content grant](./get-media-assets-by-id-content/) |
| `POST` | `/media/uploads` | [Create a presigned image or listing video upload grant](./post-media-uploads/) |
| `POST` | `/media/uploads/{id}/complete` | [Confirm the object arrived and start processing](./post-media-uploads-by-id-complete/) |
