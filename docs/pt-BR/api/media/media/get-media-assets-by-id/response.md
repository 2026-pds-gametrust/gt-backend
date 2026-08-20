# Contrato de saída — Get media asset metadata

**HTTP 200** — Asset metadata (evidence never includes public URLs)

**Schema OpenAPI:** `MediaAsset`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `id` | string | sim |  |
| `purpose` | enum(PRODUCT \| LISTING \| EVIDENCE) | sim |  |
| `ownerId` | string | sim |  |
| `status` | enum(PENDING_UPLOAD \| UPLOADED \| PROCESSING \| READY \| FAILED) | sim |  |
| `contentType` | string | sim |  |
| `byteSize` | integer | sim |  |
| `variants` | array<MediaVariant> | sim |  |
| `createdAt` | string (date-time) | sim |  |
| `updatedAt` | string (date-time) | não |  |

**Exemplo:**

```json
{
  "id": "string",
  "purpose": "PRODUCT",
  "ownerId": "string",
  "status": "PENDING_UPLOAD",
  "contentType": "string",
  "byteSize": 0,
  "variants": [
    {
      "size": "THUMBNAIL",
      "format": "WEBP",
      "width": 0,
      "height": 0,
      "byteSize": 0,
      "publicUrl": "string"
    }
  ],
  "createdAt": "2026-08-07T12:00:00.000Z",
  "updatedAt": "2026-08-07T12:00:00.000Z"
}
```

## Erros documentados

- **403** — Forbidden
- **404** — Asset not found

### HTTP 403

Forbidden

**Exemplo:**

```json
{
  "error": "string",
  "code": "RESOURCE_NOT_FOUND",
  "contextInfo": {}
}
```

Usuário autenticado sem permissão — mensagem de acesso negado, sem fingir que a ação ocorreu.

### HTTP 404

Asset not found

**Exemplo:**

```json
{
  "error": "string",
  "code": "RESOURCE_NOT_FOUND",
  "contextInfo": {}
}
```

Empty-state / 404 de página. Não inventar recurso.

