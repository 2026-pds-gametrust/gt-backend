# PriceHistory — Interface

## Domain type

`IPriceHistory`

## Fields

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | string | yes |  |
| productId | string | yes |  |
| priceCents | number | yes | Integer Money |
| currency | string | yes | BRL |
| source | EPriceHistorySource | yes | LISTING_PUBLISHED | LISTING_SOLD | MANUAL |
| observedAt | Date | yes |  |
| createdAt | Date | yes |  |

## Local invariants (Entity)

- priceCents >= 0 integer

## Enums

- `EPriceHistorySource: LISTING_PUBLISHED, LISTING_SOLD, MANUAL`
