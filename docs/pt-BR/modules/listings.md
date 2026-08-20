# Listings

Ofertas unitárias (oferta ≠ produto). API: [listings](../api/listings/). Inglês: [en](../../en/modules/listings.md).

Entidades: [listing](../../entities/listing/) · [listing-event](../../entities/listing-event/).

Spec de revisão: [listing-moderation-revision-flow](../../specs/listing-moderation-revision-flow/requirements.md).

## Papel

Cada listing é **uma unidade física** (quantity sempre 1). Ownership é regra de Service via `ActorContext`, não “id na URL”.

## Estados (Fase 1)

```text
DRAFT → submit → SUBMITTED → (verificação aprovada) → PUBLISHED
                              (correções pedidas)    → DRAFT  → resubmit → SUBMITTED (novo caso)
                              (rejeição definitiva)  → REJECTED (terminal)
PUBLISHED → pause → PAUSED
```

Publish é gate de **backoffice** após aprovação da verificação. Não mostre a oferta na busca até `PUBLISHED`.

### Reenvio após correções

Quando o moderador pede alterações (`CHANGES_REQUESTED`), o listing volta a `DRAFT` com feedback em `verificationSummary` (`GET /listings/mine`):

- `requiredChanges[]` — o que corrigir (foto, vídeo, descrição)
- `decisionReason` — resumo legível para o vendedor

`POST /listings/{id}/submit` valida que cada `requiredChange` foi atendida contra o `revisionBaseline` do caso (foto removida/substituída, vídeo trocado, descrição alterada). Submit bloqueado → **400** até cumprir.

Reenvio bem-sucedido abre novo caso `PENDING` ligado via `previousCaseId`.

## Regras de produto

- Nunca exibir selo até a verificação concedida (ver [verification](./verification.md)).
- A página do anúncio deve usar TrustScore **com motivos** ([trust](./trust.md)).
- Mídia precisa estar `READY` antes de tratar fotos como exibíveis ([media](./media.md)).
- `REJECTED` é terminal — vendedor não reenvia; motivo fica no último caso.

## Eventos e portas

Síncrono: **`IMediaClient`** para anexar assets READY (não URL inventada pelo cliente).

Async (depois do persist):

| Evento | Quando | Consumer ligado |
|--------|--------|-----------------|
| `listings.listing.created` | Draft criado | ainda não |
| `listings.listing.submitted` | Submit do vendedor | verification `ensureOpenCaseForListing` + IA análise |
| `listings.listing.status_changed` | Qualquer transição (`toStatus` no payload) | search + verification (se SUBMITTED / PUBLISHED / PAUSED) |
| `listings.listing.published` | Após aprovação | search `reindexListing` |
| `listings.listing.paused` | Pause | search `deleteOnUnpublish` |

Consome:

| Evento | Efeito |
|--------|--------|
| `verification.case.approved` | `applyVerificationApproved` (auto-publish) |
| `verification.case.changes_requested` | `applyVerificationChangesRequested` (`SUBMITTED→DRAFT`) |
| `verification.case.rejected` | `applyVerificationRejected` (`SUBMITTED→REJECTED`) |

```text
DRAFT --submit--> SUBMITTED --case.approved--> PUBLISHED --pause--> PAUSED
                     |    \
                     |     +--case.changes_requested--> DRAFT --resubmit-->
                     |     +--case.rejected--> REJECTED
                     v
              caso de verificação
```

Detalhe: [mensageria](../architecture/messaging.md) · [comunicação](../architecture/communication.md).

## Relacionados

- [Verificação](./verification.md) · [Busca](./search.md) · [Mídia](./media.md)
- API: [listings](../api/listings/)
