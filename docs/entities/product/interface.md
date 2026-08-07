# Product — Interface

## Domain type

`IProduct`

Canonical **catalog model** (Pichau-like): brand/model/SKU grouping many used `listing` units. Inspired by retail cards (brand, model, memory, bus, MPN) — not a sellable stock row.

## Fields

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | string | yes | Stable public id |
| categoryId | string | yes | Taxonomy node |
| brand | string | yes | e.g. ASUS, MSI, NVIDIA partner brands |
| model | string | yes | Commercial model name |
| series | string | no | e.g. GeForce RTX 50, Radeon RX |
| slug | string | yes | Unique URL slug |
| mpn | string | no | Manufacturer part number (Pichau-style codes on cards) |
| ean | string | no | Barcode when known |
| sku | string | no | Internal catalog SKU (unique if set) |
| specs | Record<string, string \| number \| boolean> | no | Values keyed by `category-attribute-schema` keys (VRAM GB, memory type, bus bits, chipset, …) |
| imageUrls | string[] | no | Reference gallery for the model (not seller evidence) |
| referencePriceCents | number | no | Optional MSRP/guide band anchor (Money); not the listing price |
| currency | string | no | Default BRL when referencePrice set |
| status | EProductStatus | yes | ACTIVE \| INACTIVE |
| createdAt | Date | yes | |
| updatedAt | Date | yes | |

## Local invariants (Entity)

- `brand`, `model`, `slug` non-empty
- `referencePriceCents` if set: integer ≥ 0
- `sku` / `mpn` / `ean` format non-empty when provided
- `categoryId` existence validated in **Service**

## Enums

- `EProductStatus: ACTIVE, INACTIVE`

## Benchmark notes

- Pichau card text packs brand + model + VRAM + GDDR + bit-width + MPN → split into `brand`/`model`/`specs`/`mpn`.
- Mercado Livre `BRAND` and other MAIN attributes → stored as product `specs` + schema defs, not free-text only.
