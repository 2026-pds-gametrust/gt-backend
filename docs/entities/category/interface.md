# Category — Interface

## Domain type

`ICategory`

## Fields

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | string | yes | Stable public id |
| slug | string | yes | Unique per collection; URL-safe |
| name | string | yes | Canonical display name; unique per collection |
| synonyms | string[] | no | Normalized aliases; global uniqueness across categories∪services |
| parentId | string | null | no | Optional hierarchy |
| status | ECategoryStatus | yes | ACTIVE | INACTIVE |
| createdAt | Date | yes | timestamps |
| updatedAt | Date | yes | timestamps |

## Local invariants (Entity)

- slug and name non-empty after trim
- synonyms stored normalized (lowercase, collapsed spaces)

## Enums

- `ECategoryStatus: ACTIVE, INACTIVE`
