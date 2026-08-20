# Synonym — Interface

## Domain type

`ISynonym`

## Fields

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | string | yes |  |
| normalizedTerm | string | yes | Unique |
| targetType | ESynonymTargetType | yes | CATEGORY | SERVICE |
| targetId | string | yes |  |
| canonicalName | string | yes |  |
| updatedAt | Date | yes |  |

## Local invariants (Entity)

- normalizedTerm unique
- rebuildable from catalog

## Enums

- `ESynonymTargetType: CATEGORY, SERVICE`
