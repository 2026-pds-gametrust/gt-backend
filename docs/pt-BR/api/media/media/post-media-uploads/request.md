# Contrato de entrada — Create a presigned image or listing video upload grant

**Schema OpenAPI:** `NewMediaUpload`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `id` | string | não |  |
| `purpose` | enum(PRODUCT \| LISTING \| EVIDENCE) | sim |  |
| `ownerId` | string | sim |  |
| `contentType` | enum(image/jpeg \| image/png \| image/webp \| video/mp4) | sim | Images max 10 MiB. video/mp4 max 50 MiB and LISTING purpose only.
 |
| `byteSize` | integer | sim |  |

**Exemplo:**

```json
{
  "id": "string",
  "purpose": "PRODUCT",
  "ownerId": "string",
  "contentType": "image/jpeg",
  "byteSize": 1
}
```
