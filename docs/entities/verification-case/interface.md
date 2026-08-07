# VerificationCase — Interface

## Domain type

`IVerificationCase`

## Fields

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | string | yes |  |
| listingId | string | yes |  |
| status | EVerificationCaseStatus | yes | PENDING|IN_REVIEW|APPROVED|REJECTED |
| checklist | object | no | Category-specific |
| decisionReason | string | no |  |
| moderatorId | string | no |  |
| createdAt | Date | yes |  |
| updatedAt | Date | yes |  |

## Local invariants (Entity)

- None beyond required fields

## Enums

- `EVerificationCaseStatus: PENDING, IN_REVIEW, APPROVED, REJECTED`
