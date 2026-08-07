# Search Reconciliation MVP — Design

feature: search-reconciliation-mvp
status: Approved
version: 0.1.0
owner: Architecture
createdAt: 2026-08-07
updatedAt: 2026-08-07
approvedBy: Plan execution gate (entity loop E20)
approvedAt: 2026-08-07

Requirements: docs/specs/search-reconciliation-mvp/requirements.md (version 0.1.0)

## Placement

| Concern | Layer |
|---------|-------|
| Orchestration + counts | `SearchReconciliationService` (domain/search) |
| Listing reindex path | Reuse `SearchDocumentService.reindexListing` (E16) |
| Synonym projection | Reuse `SynonymService.upsertFromTaxonomy` (E17) |
| HTTP | `SearchController` `POST /search/reconcile` |
| Wiring | `SearchReconciliationServiceFactory` + `SearchControllerFactory` |

## End-to-end flow

1. Backoffice calls `POST /search/reconcile`
2. Service lists PUBLISHED listings → `reindexListing` each → count successes
3. Service lists categories + services → upsert name+synonyms → count upserts
4. Returns `{ listingsReindexed, synonymsUpserted }`

## Decisions

| ID | Decision |
|----|----------|
| D1 | Dedicated `SearchReconciliationService` (not methods bolted onto SearchDocument alone) |
| D2 | Path `POST /search/reconcile` with `authorizeByGroup([BACKOFFICE, ADMIN])` |
| D3 | Counts = successful reindexes / successful synonym upserts (skip empty terms) |
| D4 | No new collections; rebuilds existing read models only |

## Approval

- Status: APPROVED
- Approved version: 0.1.0
