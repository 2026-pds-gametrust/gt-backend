# Price History MVP — Requirements

feature: price-history-mvp
status: Approved
version: 0.1.0
owner: Product
createdAt: 2026-08-07
updatedAt: 2026-08-07
approvedBy: Plan execution gate (entity loop E07)
approvedAt: 2026-08-07

## Objective

OBJ-01 — Append-only price observations for products.

## Scope

- Append on product reference price create/update
- Append on listing price change / publish
- GET /products/:productId/price-history
- No update/delete API

## Out of scope

- Non-MVP transitions (reserve/sold P2) beyond documented machine
- Verification module consumer wiring (publish is backoffice MVP gate)

## Acceptance criteria

- AC-01: List for missing product returns 404
- AC-02: List returns appended observations
- AC-03: Entries are append-only via repository write

## Entity source

docs/entities/price-history/
