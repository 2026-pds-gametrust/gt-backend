# Search Reconciliation MVP — Test plan

feature: search-reconciliation-mvp
status: Approved
version: 0.1.0
owner: Quality Assurance
createdAt: 2026-08-07
updatedAt: 2026-08-07

Requirements: docs/specs/search-reconciliation-mvp/requirements.md (version 0.1.0)
Design: docs/specs/search-reconciliation-mvp/design.md

## Test matrix

| ID | Level | Scenario | Expected |
|----|-------|----------|----------|
| T1 | int controller | POST /search/reconcile with seeded PUBLISHED listing + category synonym (no prior projections) | 200; counts ≥ 1; `search_documents` and `synonyms` present |

Naming: `describe('when …')` / `it('should …')`.

## Commands

| Purpose | Command |
|---------|---------|
| Targeted | `yarn test:int -- search-reconcile` |
| Lint | `yarn lint` |
