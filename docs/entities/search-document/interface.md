# SearchDocument — Interface

## Domain type

`ISearchDocument`

Disposable denormalized card for discovery (Pichau category grid + ML search result inspiration).

## Fields

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | string | yes | Usually `listingId` |
| listingId | string | yes | |
| productId | string | yes | |
| categoryId | string | yes | |
| sellerId | string | yes | |
| title | string | yes | |
| brand | string | no | From product |
| model | string | no | From product |
| condition | string | yes | Listing condition |
| status | string | yes | Only PUBLISHED in default queries |
| priceCents | number | yes | |
| listPriceCents | number | no | Discount UI |
| currency | string | yes | BRL |
| locationApprox | string | no | City/UF |
| shippingModes | string[] | no | PICKUP, SHIPPING |
| freeShipping | boolean | no | Flag from listing |
| trustScore | number | no | |
| sellerLevel | string | no | |
| sealTypes | string[] | no | |
| facets | Record<string, string \| number \| boolean> | no | Filterable attrs (brand, vram_gb, …) |
| searchText | string | yes | Title + brand + model + synonyms + key specs |
| thumbnailUrl | string | no | Cover photo |
| embedding | number[] \| null | no | P3 |
| sourceOccurredAt | Date | yes | Apply-if-newer |
| updatedAt | Date | yes | |

## Local invariants (Entity)

- rebuildable; never written back to owners
- default search excludes non-PUBLISHED

## Enums

- None
