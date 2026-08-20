# Atlas Search MVP — Design

feature: atlas-search-mvp
status: Approved
version: 0.1.0
owner: Architecture
jira: N/A
createdAt: 2026-08-07
updatedAt: 2026-08-07
approvedBy: Plan execution gate (Ralph loop E25)
approvedAt: 2026-08-07

Requirements: docs/specs/atlas-search-mvp/requirements.md (version 0.1.0)

## Context

Lexical search for Phase 1 per `docs/architecture/06-rag-and-vector-search.md`. Replace direct `repository.search` usage in `SearchDocumentService` with port `ISearchEngine`.

## Requirements coverage

| Requirement | Technical support | Notes |
|-------------|-------------------|-------|
| AC-01 | `ISearchEngine` + `SearchEngineFactory` | mongo default in test |
| AC-02 | `SearchDocumentService.expandQueryWithSynonyms` | via `SynonymService.listSynonyms` |
| AC-03 | QueryLog + zero-result after engine | unchanged envelope |
| AC-04 | Index JSON below + infra file | DEC-063 |
| NFR-01 | `SEARCH_ENGINE=mongo` in Jest | no Atlas required |
| NFR-02 | Domain port only | `$search` in infra |

## End-to-end flow

1. HTTP GET `/search` → SearchController → SearchDocumentService.search
2. Optional synonym expansion of `q`
3. `ISearchEngine.search` (MongoTextSearchEngine or AtlasSearchEngine)
4. QueryLog + optional `search.zero-result.recorded`
5. Return `ISearchDocument[]`

## Layers impacted

| Layer | Paths / artifacts | Change |
|-------|-------------------|--------|
| Domain | `src/domain/search/engine/search-engine.interface.ts` | port |
| Domain | `src/domain/search/service/search-document.service*.ts` | inject engine + synonym |
| Infraestructure | `src/infraestructure/search/*.engine.ts` | mongo + atlas |
| Infraestructure | `src/infraestructure/db/mongo/search-indexes/...json` | index def |
| Configuration | `src/configuration/factory/search-engine.factory.ts` | env wiring |
| Configuration | `search-document.service.factory.ts` | inject deps |

## Decisions

| ID | Decision | Chosen | Rejected |
|----|----------|--------|----------|
| D1 | Engine port | `ISearchEngine` in domain | Repo-only search forever |
| D2 | Prod engine | Atlas `$search` index `search_documents_lexical` | Always regex |
| D3 | Test/local | `MongoTextSearchEngine` via repo regex (multi-term OR) | Require Atlas in CI |
| D4 | Atlas fail | Clear error when `SEARCH_ENGINE=atlas` | Silent fallback |
| D5 | Synonyms | Expand in service before engine | Atlas synonym mapping only |

## Atlas index definition (`search_documents_lexical`)

Versioned copy: `src/infraestructure/db/mongo/search-indexes/search_documents.search_documents_lexical.json`

```json
{
  "name": "search_documents_lexical",
  "collectionName": "search_documents",
  "type": "search",
  "definition": {
    "mappings": {
      "dynamic": false,
      "fields": {
        "searchText": { "type": "string", "analyzer": "lucene.standard" },
        "title": { "type": "string", "analyzer": "lucene.standard" },
        "brand": { "type": "string", "analyzer": "lucene.standard" },
        "model": { "type": "string", "analyzer": "lucene.standard" },
        "categoryId": { "type": "token" },
        "status": { "type": "token" },
        "facets": { "type": "document", "dynamic": true }
      }
    }
  }
}
```

## Atlas query shape

`$search` compound: `must` text on `searchText|title|brand|model` when `q` present; `filter` equals on `status`, optional `categoryId`, optional `facets.<key>`.

## Persistence / compatibility

- No schema change on `search_documents`
- Index applied out-of-band (script/CI) — not created by app boot
- Rollback: set `SEARCH_ENGINE=mongo`

## Observability

- Atlas failures logged via `serviceLogErrorHandler` with index name
- QueryLog stores original `q` (not expanded)

## Approval

- Status: APPROVED
- Approved by: Plan execution gate (Ralph loop E25)
- Date: 2026-08-07
- Approved version: 0.1.0

## Changelog

### 0.1.0 — 2026-08-07

- Initial approved design for E25
