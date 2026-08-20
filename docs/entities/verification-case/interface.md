# VerificationCase — Interface

## Domain type

`IVerificationCase`

## Fields

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | string | yes |  |
| listingId | string | yes |  |
| status | EVerificationCaseStatus | yes | PENDING\|IN_REVIEW\|APPROVED\|CHANGES_REQUESTED\|REJECTED |
| checklist | object | no | Category-specific; may include `aiAnalysis` score |
| decisionReason | string | no | Seller-facing summary on reject or request-changes |
| moderatorId | string | no |  |
| requiredChanges | IRequiredChange[] | no | Set when status is CHANGES_REQUESTED |
| revisionBaseline | IRevisionBaseline | no | Snapshot at request-changes time (assetIds, video, description) |
| previousCaseId | string | no | On resubmit case, points to prior CHANGES_REQUESTED case |
| createdAt | Date | yes |  |
| updatedAt | Date | yes |  |

### Nested `IRequiredChange`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| target | ERequiredChangeTarget | yes | PHOTO \| VIDEO \| DESCRIPTION |
| reason | string | yes | Actionable for seller |
| assetId | string | no | Required for PHOTO; optional for VIDEO (defaults to listing video) |
| checklistItemId | string | no | Link to checklist item when applicable |

### Nested `IRevisionBaseline`

| Field | Type | Notes |
| --- | --- | --- |
| assetIds | string[] | Photo asset ids at request-changes time |
| videoAssetId | string | Listing video at request-changes time |
| description | string | Description text at request-changes time |

## Local invariants (Entity)

- None beyond required fields

## Enums

- `EVerificationCaseStatus: PENDING, IN_REVIEW, APPROVED, CHANGES_REQUESTED, REJECTED`
- `ERequiredChangeTarget: PHOTO, VIDEO, DESCRIPTION`

## HTTP schemas (OpenAPI)

- `RequestVerificationChanges` — body for `POST /verification-cases/{id}/request-changes`
- `SellerVerificationSummary` — nested in `GET /listings/mine` items
