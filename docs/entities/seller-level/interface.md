# SellerLevel — Interface

## Domain type

`ISellerLevel`

## Fields

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | string | yes |  |
| sellerId | string | yes | Unique |
| level | ESellerLevel | yes |  |
| updatedAt | Date | yes |  |

## Local invariants (Entity)

- None beyond required fields

## Enums

- `ESellerLevel: NEW, EVOLVING, TRUSTED, EXCELLENT`
