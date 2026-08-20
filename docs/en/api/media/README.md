# Domain: media

## Product value

Image upload (product, listing, evidence). Ownership in the Service; this HTTP slice may not require Bearer in the contract.

## Endpoints (4)

| Method | Path | Summary | Contract |
|--------|------|--------|----------|
| `GET` | `/media/assets/{id}` | Get media asset metadata | [open](./media/get-media-assets-by-id/) |
| `GET` | `/media/assets/{id}/content` | Get a short-lived content grant | [open](./media/get-media-assets-by-id-content/) |
| `POST` | `/media/uploads` | Create a presigned image or listing video upload grant | [open](./media/post-media-uploads/) |
| `POST` | `/media/uploads/{id}/complete` | Confirm the object arrived and start processing | [open](./media/post-media-uploads-by-id-complete/) |

## Resources

- [`media/`](./media/)
