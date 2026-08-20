# Domínio: media

## Ganho no produto

Upload de imagens (produto, anúncio, evidência). Ownership no service; rotas HTTP desta fatia não exigem Bearer no contrato.

## Endpoints (4)

| Método | Path | Resumo | Contrato |
|--------|------|--------|----------|
| `GET` | `/media/assets/{id}` | Get media asset metadata | [abrir](./media/get-media-assets-by-id/) |
| `GET` | `/media/assets/{id}/content` | Get a short-lived content grant | [abrir](./media/get-media-assets-by-id-content/) |
| `POST` | `/media/uploads` | Create a presigned image or listing video upload grant | [abrir](./media/post-media-uploads/) |
| `POST` | `/media/uploads/{id}/complete` | Confirm the object arrived and start processing | [abrir](./media/post-media-uploads-by-id-complete/) |

## Recursos

- [`media/`](./media/)
