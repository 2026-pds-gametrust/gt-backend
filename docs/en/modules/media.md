# Media

Upload grants, processing, content grants. API: [media](../api/media/). Portuguese: [pt-BR](../../pt-BR/modules/media.md).

## Role

Images for products, listings, and (restricted) evidence. Ownership is a Service rule. HTTP operations in this slice may be documented without Bearer in OpenAPI — still do not treat a client-supplied URL as storage (no SSRF).

## Flow

```text
POST /media/uploads              → temporary upload URL
POST /media/uploads/{id}/complete
GET  /media/assets/{id}          → wait until status READY
GET  /media/assets/{id}/content  → read grant
```

Attach `id` on `Listing.media` / evidence. **Do not display** until `READY`. Do not invent media on the client.

Evidence raw bytes are restricted-class ([security](../architecture/security.md)).

## Events and ports

Other modules **must not** import media repositories. They use **`IMediaClient`** (sync): `assertAttachableAsset`, `getReadyAsset`, public URL resolvers.

| Event | When | Wired consumer |
|-------|------|----------------|
| `media.asset.uploaded` | Upload grant completed | same module `processUploadedAsset` |
| `media.asset.processed` | Variants ready | none yet (listings/catalog/verification planned) |

## Related

- [Communication](../architecture/communication.md) · [Messaging](../architecture/messaging.md)
- API: [media](../api/media/)
