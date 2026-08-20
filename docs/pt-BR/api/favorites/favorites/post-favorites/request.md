# Contrato de entrada — Create a favorite

**Schema OpenAPI:** `NewFavorite`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| `id` | string | sim |  |
| `userId` | string | não | Ignored for ownership; userId is taken from x-user-id (ActorContext) |
| `targetType` | enum(PRODUCT \| LISTING) | sim |  |
| `targetId` | string | sim |  |

**Exemplo:**

```json
{
  "id": "string",
  "userId": "string",
  "targetType": "PRODUCT",
  "targetId": "string"
}
```
