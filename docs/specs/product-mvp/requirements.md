# Product MVP — Requirements

feature: product-mvp
status: Approved
version: 0.1.0
owner: Product
createdAt: 2026-08-07
updatedAt: 2026-08-07
approvedBy: Plan execution gate (entity loop E06)
approvedAt: 2026-08-07

## Objective

OBJ-01 — Manage canonical catalog products with unique slug and optional SKU.

## Scope

- CRUD under /products
- categoryId must exist; unique slug; optional unique sku
- Events catalog.product.created / .updated
- Append price history when referencePriceCents set/changed

## Out of scope

- Non-MVP transitions (reserve/sold P2) beyond documented machine
- Verification module consumer wiring (publish is backoffice MVP gate)

## Acceptance criteria

- AC-01: Duplicate slug returns 409
- AC-02: Missing category returns 404
- AC-03: Create publishes catalog.product.created
- AC-04: Reference price change appends price_history

## Entity source

docs/entities/product/
