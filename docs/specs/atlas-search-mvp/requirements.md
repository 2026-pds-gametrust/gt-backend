# Atlas Search MVP — Requirements

feature: atlas-search-mvp
status: Approved
version: 0.1.0
owner: Product
jira: N/A
createdAt: 2026-08-07
updatedAt: 2026-08-07
approvedBy: Plan execution gate (Ralph loop E25)
approvedAt: 2026-08-07

Classification: Feature slice

## Related specifications

- docs/architecture/06-rag-and-vector-search.md
- docs/specs/search-document-mvp/requirements.md
- docs/specs/synonym-mvp/requirements.md
- docs/ralph/ledgers/loop-e25-atlas-search.md

## Context

### Current situation

`SearchDocumentService.search` queries Mongo with regex via `SearchDocumentRepositoryRead.search`. Local/Jest works; production lacks Atlas Search lexical index and a swappable engine port.

### Problem or opportunity

Phase 1 needs Atlas Search for lexical ranking/typo tolerance in prod while keeping a Mongo regex fallback for tests and local without Atlas.

### Business impact

Buyers get better discovery in production without breaking hermetic integration tests.

## Objective

### OBJ-01 — Lexical search behind ISearchEngine

Search delegates to `ISearchEngine` (Atlas or Mongo) with synonym expansion and existing QueryLog / zero-result behavior.

## Actors

### ACT-01 — Buyer / anonymous searcher

- Goal: find published listings by text and filters
- Permissions: public read on `/search`
- Relevant context: query string, category, facets

### ACT-02 — Operator / platform

- Goal: run Atlas in prod, Mongo fallback in test/local
- Permissions: configure `SEARCH_ENGINE`
- Relevant context: env + index definition

## User stories

### US-01 — Search via engine port

As a buyer,
I want lexical search that works in prod (Atlas) and tests (Mongo),
so that discovery is reliable across environments.

### US-02 — Synonym-aware query

As a buyer,
I want colloquial terms expanded via synonyms,
so that aliases like taxonomy projections still match listings.

## Business rules

### BR-01 — Engine selection

Source: Decision DEC-062 / E25

`SEARCH_ENGINE=mongo|atlas`. Default `mongo` when `NODE_ENV=test`; otherwise env or `mongo`.

### BR-02 — Synonym expansion

Source: Confirmed

When `q` is present, expand via `SynonymService.listSynonyms` by appending matching `canonicalName` / `normalizedTerm` before calling the engine.

### BR-03 — Observability unchanged

Source: Confirmed

QueryLog append and `search.zero-result.recorded` remain after engine search.

### BR-04 — Atlas failure clarity

Source: Confirmed

When `SEARCH_ENGINE=atlas` and Atlas Search is unavailable, throw a clear error (do not silent-fallback).

## Product flows

### FLOW-01 — Main search

1. Client calls GET `/search?q=...`
2. Service expands synonyms when `q` present
3. Service calls `ISearchEngine.search`
4. Service appends QueryLog; publishes zero-result event if empty
5. Returns documents

### FLOW-02 — Atlas unavailable

1. `SEARCH_ENGINE=atlas`
2. Engine `$search` fails (missing index / non-Atlas)
3. Clear 503/DATABASE_ERROR surfaced — no silent mongo fallback

## Acceptance criteria

### AC-01 — Port + factory

Traceability: OBJ-01, BR-01

`ISearchEngine` exists; factory selects mongo|atlas; int tests use mongo.

### AC-02 — Synonym expansion

Traceability: US-02, BR-02

Search with matching synonym expands `q` before engine call.

### AC-03 — QueryLog + zero-result

Traceability: BR-03

Existing QueryLog and zero-result event behavior preserved.

### AC-04 — Index definition documented

Traceability: OBJ-01

Atlas index JSON for `search_documents_lexical` lives in design + versioned infra file.

## Non-functional requirements

### NFR-01 — Hermetic tests

`yarn test:int` does not require Atlas Search (`SEARCH_ENGINE=mongo`).

### NFR-02 — Layering

Domain holds only the port; Atlas/`$search` stay in infraestructure.

## Out of scope

- Vector / hybrid search (Phase 3)
- Fuzzy operator tuning beyond Atlas defaults
- Changing OpenAPI search contract fields

## Definition of Ready

- [x] Requirements approved for E25
- [x] Architecture DEC-062/063 referenced

## Definition of Done

- [x] Engine port + mongo/atlas implementations
- [x] Service uses engine + synonym expansion
- [x] Specs + ledger E25
- [ ] `yarn test:int` green

## Open questions

- none

## Changelog

### 0.1.0 — 2026-08-07

- Initial approved requirements for Ralph loop E25
