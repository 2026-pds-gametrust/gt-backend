# Seal — Interface

## Domain type

`ISeal`

## Fields

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | string | yes |  |
| listingId | string | yes |  |
| caseId | string | yes |  |
| type | ESealType | yes |  |
| status | ESealStatus | yes | GRANTED|SUSPENDED|EXPIRED|REVOKED |
| grantedAt | Date | no |  |
| expiresAt | Date | no |  |
| createdAt | Date | yes |  |
| updatedAt | Date | yes |  |

## Local invariants (Entity)

- None beyond required fields

## Enums

- `ESealType: POSSESSION, FUNCTIONING, IDENTITY, PROTECTED_PURCHASE, WARRANTY`
- `ESealStatus: GRANTED, SUSPENDED, EXPIRED, REVOKED`
