# Listings

Unit offers (oferta ≠ produto). API: [listings](../api/listings/). Portuguese: [pt-BR](../../pt-BR/modules/listings.md).

Entities: [listing](../../entities/listing/) · [listing-event](../../entities/listing-event/).

Revision spec: [listing-moderation-revision-flow](../../specs/listing-moderation-revision-flow/requirements.md).

## Role

Each listing is **one physical unit** (quantity always 1). Ownership is a Service rule from `ActorContext`, not “id in the URL”.

## State (Phase 1)

```text
DRAFT → submit → SUBMITTED → (verification approved) → PUBLISHED
                              (changes requested)      → DRAFT  → resubmit → SUBMITTED (new case)
                              (definitive reject)      → REJECTED (terminal)
PUBLISHED → pause → PAUSED
```

Publish is a **backoffice** gate after verification approval. Do not show the offer in search until `PUBLISHED`.

### Resubmit after corrections

When a moderator requests changes (`CHANGES_REQUESTED`), the listing returns to `DRAFT` with feedback in `verificationSummary` (`GET /listings/mine`):

- `requiredChanges[]` — what to fix (photo, video, description)
- `decisionReason` — seller-facing summary

`POST /listings/{id}/submit` validates each `requiredChange` against the case `revisionBaseline` (photo removed/replaced, video swapped, description changed). Blocked submit → **400** until satisfied.

Successful resubmit opens a new `PENDING` case linked via `previousCaseId`.

## Product rules

- Never display a seal until verification granted (see [verification](./verification.md)).
- Listing page should use TrustScore **with reasons** ([trust](./trust.md)).
- Media must be `READY` before you treat photos as displayable ([media](./media.md)).
- `REJECTED` is terminal — seller cannot resubmit; reason stays on the last case.

## Events and ports

Sync: **`IMediaClient`** to attach READY assets (not a client-supplied URL).

Async (after persist):

| Event | When | Wired consumer |
|-------|------|----------------|
| `listings.listing.created` | Draft created | none yet |
| `listings.listing.submitted` | Seller submit | verification `ensureOpenCaseForListing` + AI analysis |
| `listings.listing.status_changed` | Any transition (`toStatus` in payload) | search + verification (if SUBMITTED / PUBLISHED / PAUSED) |
| `listings.listing.published` | After verification approval | search `reindexListing` |
| `listings.listing.paused` | Pause | search `deleteOnUnpublish` |

Consumes:

| Event | Effect |
|-------|--------|
| `verification.case.approved` | `applyVerificationApproved` (auto-publish) |
| `verification.case.changes_requested` | `applyVerificationChangesRequested` (`SUBMITTED→DRAFT`) |
| `verification.case.rejected` | `applyVerificationRejected` (`SUBMITTED→REJECTED`) |

```text
DRAFT --submit--> SUBMITTED --case.approved--> PUBLISHED --pause--> PAUSED
                     |    \
                     |     +--case.changes_requested--> DRAFT --resubmit-->
                     |     +--case.rejected--> REJECTED
                     v
              verification case
```

Detail: [messaging](../architecture/messaging.md) · [communication](../architecture/communication.md).

## Related

- [Verification](./verification.md) · [Search](./search.md) · [Media](./media.md)
- API: [listings](../api/listings/)
