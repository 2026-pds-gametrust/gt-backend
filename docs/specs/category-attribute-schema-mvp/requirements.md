# Category Attribute Schema MVP — Requirements

feature: category-attribute-schema-mvp
status: Approved
version: 0.1.0
owner: Product
createdAt: 2026-08-07
updatedAt: 2026-08-07
approvedBy: Plan execution gate (entity loop E05)
approvedAt: 2026-08-07

## Objective

OBJ-01 — Manage per-category attribute definitions (keys, types, facets).

## Scope

- GET/PUT /categories/:categoryId/attribute-schema
- Validate unique attribute keys; ENUM requires enumValues
- categoryId must exist; update bumps version

## Out of scope

- Non-MVP transitions (reserve/sold P2) beyond documented machine
- Verification module consumer wiring (publish is backoffice MVP gate)

## Acceptance criteria

- AC-01: Upsert for missing category returns 404
- AC-02: First upsert creates version 1
- AC-03: Second upsert bumps version
- AC-04: Duplicate keys / empty ENUM enumValues rejected

## Entity source

docs/entities/category-attribute-schema/
