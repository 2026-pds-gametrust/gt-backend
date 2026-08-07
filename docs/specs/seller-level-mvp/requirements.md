# SellerLevel MVP — Requirements

feature: seller-level-mvp
status: Approved
version: 0.1.0
owner: Product
createdAt: 2026-08-07
updatedAt: 2026-08-07
approvedBy: Plan execution gate (entity loop E15)
approvedAt: 2026-08-07

## Objective

OBJ-01 — Derive discrete seller tier from trust score thresholds.

## Scope

- Upsert SellerLevel for sellerId from score
- Get level by sellerId (default NEW)
- Levels: NEW, EVOLVING, TRUSTED, EXCELLENT

## Out of scope

- Manual level overrides
- Public badges UI

## Acceptance criteria

- AC-01: Score thresholds map to documented levels
- AC-02: Missing level get returns NEW
- AC-03: Recompute score updates level

## Entity source

docs/entities/seller-level/
