# Listing — Interface

## Domain type

`IListing`

One **physical used unit** offered by a seller (Mercado Livre `item` inspiration + GamerTrust evidence/trust). Unlike Pichau retail stock, `quantity` is always **1**.

## Fields

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | string | yes | |
| sellerId | string | yes | `user.id` |
| productId | string | yes | Canonical model |
| title | string | yes | Public title (ML `title`) |
| description | string | no | Seller description (not raw evidence) |
| condition | EListingCondition | yes | Maps to ML `item_condition` concept |
| priceCents | number | yes | Asking price (Money) |
| listPriceCents | number | no | Optional “de” price for discount display (Pichau-like) |
| currency | string | yes | BRL |
| attributes | Record<string, string \| number \| boolean> | no | Unit-level attrs per schema (`facetOn` LISTING/BOTH): defects notes keys, color, etc. |
| media | IListingMedia | yes | Photos/video for the **unit** (seller gallery) |
| shipping | IListingShipping | yes | How buyer can receive the item |
| locationApprox | string | no | City/UF snapshot at publish (from profile); public |
| warranty | IListingWarranty | no | Seller-offered warranty (ML `sale_terms`) |
| acceptsOffers | boolean | yes | Default false in P1; true enables P2 negotiation |
| buyNowEnabled | boolean | yes | Default true |
| quantity | number | yes | Always `1` in MVP |
| status | EListingStatus | yes | Lifecycle |
| qualityHints | object | no | Internal completeness signals for ranking |
| createdAt | Date | yes | |
| updatedAt | Date | yes | |

### Nested `IListingMedia`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| photoUrls | string[] | yes | Min 1 when submitting; public-safe |
| videoUrl | string | no | |
| coverPhotoUrl | string | no | Defaults to first photo |

### Nested `IListingShipping`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| modes | EShippingMode[] | yes | PICKUP and/or SHIPPING |
| packageWeightGrams | number | no | Required when SHIPPING for freight quote (P2) |
| packageLengthCm | number | no | |
| packageWidthCm | number | no | |
| packageHeightCm | number | no | |
| freeShipping | boolean | no | Intent flag; actual quote uses CEP (P2) |

### Nested `IListingWarranty`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| type | EWarrantyType | yes | NONE \| SELLER \| MANUFACTURER_REMAINING |
| months | number | no | When not NONE |

## Local invariants (Entity)

- `priceCents` integer ≥ 0; if `listPriceCents` set → integer ≥ `priceCents`
- `title` non-empty; `quantity === 1`
- `media.photoUrls.length >= 1` when status ∈ {SUBMITTED, PUBLISHED, …} (enforced in Service on submit)
- `shipping.modes` non-empty
- SHIPPING mode ⇒ weight/dims required before publish (Service)

## Enums

- `EListingStatus: DRAFT, SUBMITTED, PUBLISHED, PAUSED, EXPIRED, RESERVED, SOLD`
- `EListingCondition: NEW, LIKE_NEW, GOOD, FAIR, POOR`
- `EShippingMode: PICKUP, SHIPPING`
- `EWarrantyType: NONE, SELLER, MANUFACTURER_REMAINING`

## Benchmark notes

- ML item: title, price, pictures, shipping, seller_address approx, condition, warranty terms, buy_it_now.
- Pichau: dual price display, PIX/installments → UI/checkout; domain keeps cents + optional list price.
- Evidence/proof protocol stays in `verification` — listing media ≠ restricted evidence vault.
