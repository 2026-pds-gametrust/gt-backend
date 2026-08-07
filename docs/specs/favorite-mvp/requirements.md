# Favorite MVP — Requirements

feature: favorite-mvp
status: Approved
version: 0.1.0
owner: Product
createdAt: 2026-08-07
updatedAt: 2026-08-07
approvedBy: Plan execution gate (entity loop E19)
approvedAt: 2026-08-07

## Objective

OBJ-01 — Allow users to save products or listings as favorites.

## Scope

- Unique (userId, targetType, targetId) where targetType is PRODUCT \| LISTING
- POST /favorites, DELETE /favorites/:id, GET /favorites?userId=
- Light validation that user and target exist when repos available

## Out of scope

- Saved searches / alerts (P2)
- Price-drop notifications

## Acceptance criteria

- AC-01: Create favorite returns 201
- AC-02: Duplicate pair returns 409 RESOURCE_CONFLICT
- AC-03: Delete missing returns 404
- AC-04: List by userId returns favorites

## Entity source

docs/entities/favorite/
