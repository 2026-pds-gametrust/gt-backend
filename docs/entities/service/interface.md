# Service — Interface

## Domain type

`IService`

## Fields

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | string | yes | Stable public id |
| slug | string | yes | Unique per collection |
| name | string | yes | Canonical name; unique per collection |
| synonyms | string[] | no | Normalized; global uniqueness vs categories |
| status | EServiceTaxonomyStatus | yes | ACTIVE | INACTIVE |
| createdAt | Date | yes |  |
| updatedAt | Date | yes |  |

## Local invariants (Entity)

- slug/name required
- synonyms normalized

## Enums

- `EServiceTaxonomyStatus: ACTIVE, INACTIVE`
