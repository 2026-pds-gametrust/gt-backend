# Verification

Cases, evidence, and seals. API: [verification](../api/verification/). Portuguese: [pt-BR](../../pt-BR/modules/verification.md).

Entities: [verification-case](../../entities/verification-case/) · [evidence-item](../../entities/evidence-item/) · [seal](../../entities/seal/).

Spec: [listing-moderation-revision-flow](../../specs/listing-moderation-revision-flow/requirements.md).

## Role

Trust differentiator. A seal is **never** a UI decoration. Show it only when the API returns an active/granted seal for that listing.

## Flow

```text
POST /listings/{id}/submit              → opens / feeds the case
GET  /verification-cases                → moderation queue (filters, search, AI score)
POST /verification-cases/{id}/assign
POST /verification-cases/{id}/approve   → enables publish + seal grant
POST /verification-cases/{id}/request-changes → granular corrections; listing back to DRAFT
POST /verification-cases/{id}/reject    → definitive rejection; listing to REJECTED
POST /seals/{id}/revoke                 → drop the trust signal immediately
```

### Request changes vs reject

| Decision | Case status | Listing | Seller |
|----------|-------------|---------|--------|
| **Request changes** | `CHANGES_REQUESTED` (terminal) | `SUBMITTED → DRAFT` | Edit and resubmit; `GET /listings/mine` exposes `requiredChanges` |
| **Reject** | `REJECTED` (terminal) | `SUBMITTED → REJECTED` | No resubmit; reason in `decisionReason` |

`request-changes` requires `summary` + ≥1 `requiredChange` with target `PHOTO` | `VIDEO` | `DESCRIPTION`. Photo/video require a listing `assetId`. The case stores `revisionBaseline` (snapshot) to validate resubmit.

A valid resubmit opens a new `PENDING` case with `previousCaseId` pointing to the prior case.

Evidence media is **restricted** (private bucket, presigned URLs). Public pages use the reviewed summary, not raw evidence.

## Moderation queue

`GET /verification-cases` (backoffice) supports:

- `status`, `q` (case, listing, seller), `moderatorId`
- `minScore` / `maxScore` — AI score in `checklist.aiAnalysis` (0–100)
- `hasAiScore` — filter cases with/without AI score
- pagination (`limit`, `offset`) and aggregate stats in the response

## Product rules

- No seal icon/color without `GRANTED` (or equivalent status from the API).
- Reject reasons and change requests must be actionable for the seller.
- AI may suggest score/checklist; **moderator confirms** — never auto-decides approve/reject/request-changes.
- Identity verify (`POST /users/{id}/verify`) is not a listing seal.

## Events

| Event | When | Wired consumer |
|-------|------|----------------|
| `verification.case.submitted` | Case opened | none yet |
| `verification.case.approved` | Reviewer approve | listings auto-publish |
| `verification.case.changes_requested` | Changes requested | listings `SUBMITTED→DRAFT` |
| `verification.case.rejected` | Definitive reject | listings `SUBMITTED→REJECTED` |
| `verification.seal.granted` / `.revoked` | Seal lifecycle | search reindex (visible seal) |

Consumes: `listings.listing.submitted` (and `status_changed` to `SUBMITTED`) → open case, idempotent.

Evidence media uses **`IMediaClient`** (restricted purpose). Do not put proof codes or PII on events.

## Related

- [Listings](./listings.md) · [Messaging](../architecture/messaging.md)
- API: [verification](../api/verification/)
