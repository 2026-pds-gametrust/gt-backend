# EvidenceItem — Interface

## Domain type

`IEvidenceItem`

## Fields

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | string | yes |  |
| caseId | string | yes |  |
| type | EEvidenceType | yes | PHOTO|VIDEO|PROOF_CODE_HASH |
| storageKey | string | yes | Private bucket key |
| contentHash | string | no |  |
| createdAt | Date | yes |  |

## Local invariants (Entity)

- storageKey required
- proof codes stored hashed only

## Enums

- `EEvidenceType: PHOTO, VIDEO, PROOF_CODE_HASH`
