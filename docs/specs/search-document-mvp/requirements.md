# SearchDocument MVP — Requirements

feature: search-document-mvp
status: Approved
version: 0.1.0
owner: Product
createdAt: 2026-08-07
updatedAt: 2026-08-07
approvedBy: Plan execution gate (entity loop E16)
approvedAt: 2026-08-07

## Objective

OBJ-01 — Maintain a disposable denormalized search read-model for published listings and expose lexical search.

## Scope

- Upsert search document from listing + product snapshot (trust/seal hints optional)
- Delete/hide on unpublish (pause)
- Sync on `ListingsService.publishListing` via `SearchDocumentService.reindexListing`
- GET `/search?q=&categoryId=&filters` over Mongo `search_documents` (no OpenSearch in P1)

## Out of scope

- Atlas Search / OpenSearch
- Embedding / vector search (P3)
- Autocomplete endpoint (P2 polish)

## Acceptance criteria

- AC-01: Publish upserts a PUBLISHED search document keyed by listingId
- AC-02: Pause deletes the search document for that listing
- AC-03: Search filters by text, categoryId and simple facets; default status PUBLISHED
- AC-04: Apply-if-newer respects `sourceOccurredAt`

## Entity source

docs/entities/search-document/
