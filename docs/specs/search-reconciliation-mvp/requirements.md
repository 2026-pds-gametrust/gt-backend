# Search Reconciliation MVP — Requirements

feature: search-reconciliation-mvp
status: Approved
version: 0.1.0
owner: Product
createdAt: 2026-08-07
updatedAt: 2026-08-07
approvedBy: Plan execution gate (entity loop E20)
approvedAt: 2026-08-07

Classification: Feature slice

## Objective

OBJ-01 — Provide a backoffice-triggered rebuild of search read models so drift between listings/taxonomy and `search_documents`/`synonyms` can be repaired (DEC-033).

## Scope

- Rebuild `search_documents` for all PUBLISHED listings via existing `SearchDocumentService.reindexListing`
- Rebuild `synonyms` projection from all categories + service taxonomies via `SynonymService.upsertFromTaxonomy`
- Backoffice-only HTTP `POST /search/reconcile` returning `{ listingsReindexed, synonymsUpserted }`

## Out of scope

- Scheduled/cron job runner
- OpenSearch / Atlas Search
- Async SQS consumers for reconciliation
- Deleting orphaned search documents for non-PUBLISHED listings in bulk (covered per-listing by reindex path)

## Acceptance criteria

- AC-01: Reconcile reindexes every PUBLISHED listing that has a resolvable product into `search_documents`
- AC-02: Reconcile upserts synonym projections for category and service taxonomy terms (name + synonyms)
- AC-03: `POST /search/reconcile` requires BACKOFFICE/ADMIN and returns counts
- AC-04: Idempotent re-run does not fail; counts reflect successful upserts

## Entity / architecture source

- docs/entities/search-document/
- docs/entities/synonym/
- docs/architecture/04-persistence-and-consistency.md (DEC-033)
