# Mídia

Grants de upload, processamento e leitura. API: [media](../api/media/). Inglês: [en](../../en/modules/media.md).

## Papel

Imagens de produtos, anúncios e (restrita) evidência. Ownership é regra de Service. Operações HTTP desta fatia podem estar sem Bearer no OpenAPI — ainda assim não trate URL enviada pelo cliente como storage (sem SSRF).

## Fluxo

```text
POST /media/uploads              → URL temporária de upload
POST /media/uploads/{id}/complete
GET  /media/assets/{id}          → esperar status READY
GET  /media/assets/{id}/content  → grant de leitura
```

Anexe o `id` em `Listing.media` / evidência. **Não exiba** até `READY`. Não invente mídia no cliente.

Bytes crus de evidência são classe restrita ([segurança](../architecture/security.md)).

## Eventos e portas

Outros módulos **não** importam repositórios de media. Usam **`IMediaClient`** (síncrono): `assertAttachableAsset`, `getReadyAsset`, resolvers de URL pública.

| Evento | Quando | Consumer ligado |
|--------|--------|-----------------|
| `media.asset.uploaded` | Upload confirmado | o próprio módulo `processUploadedAsset` |
| `media.asset.processed` | Variantes prontas | ainda não (listings/catalog/verification planejados) |

## Relacionados

- [Comunicação](../architecture/communication.md) · [Mensageria](../architecture/messaging.md)
- API: [media](../api/media/)
