# TrustScore — Interface

## Domain type

`ITrustScore`

## Fields

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | string | yes |  |
| sellerId | string | yes | Unique |
| score | number | yes | Derived |
| components | object | yes | Explainable breakdown |
| computedAt | Date | yes |  |
| updatedAt | Date | yes |  |

## Local invariants (Entity)

- sellerId unique

## Enums

- None
