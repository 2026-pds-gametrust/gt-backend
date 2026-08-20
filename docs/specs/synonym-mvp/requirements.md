# Synonym MVP — Requirements

feature: synonym-mvp
status: Approved
version: 0.1.0
owner: Product
createdAt: 2026-08-07
updatedAt: 2026-08-07
approvedBy: Plan execution gate (entity loop E17)
approvedAt: 2026-08-07

## Objective

OBJ-01 — Project operational synonym map from catalog category/service taxonomy for search expansion.

## Scope

- `SynonymService.upsertFromTaxonomy(term, ownerType, ownerId, canonicalName)`
- Sync projection from CategoryService / ServiceTaxonomyService after create/update
- GET `/synonyms?q=` for expansion helper

## Out of scope

- Admin write API for taxonomy aliases (catalog remains source of truth)
- Full rebuild job

## Acceptance criteria

- AC-01: Category create/update projects name + synonyms into `synonyms`
- AC-02: Service create/update projects name + synonyms into `synonyms`
- AC-03: normalizedTerm is unique; upsert is idempotent
- AC-04: GET `/synonyms` returns matching projections

## Entity source

docs/entities/synonym/
