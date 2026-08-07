# QueryLog — Interface

## Domain type

`IQueryLog`

## Fields

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | string | yes |  |
| query | string | yes |  |
| filters | object | no |  |
| resultCount | number | yes |  |
| actorId | string | no | Optional; minimize PII |
| createdAt | Date | yes |  |

## Local invariants (Entity)

- no restricted data

## Enums

- None
