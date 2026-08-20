# SearchDocument MVP — Design

feature: search-document-mvp
status: Approved
version: 0.1.0

## Citations

- docs/entities/search-document/*

## Placement

| Concern | Layer |
|---------|-------|
| ISearchDocument | domain/search |
| Upsert / search / delete | SearchDocumentService |
| Mongo `search_documents` | infraestructure |
| GET `/search` | SearchController |

## Decisions

| ID | Decision |
|----|----------|
| D1 | Collection `search_documents`; id usually equals listingId |
| D2 | Sync path: ListingService.publish → SearchDocumentService.reindexListing; pause → deleteOnUnpublish |
| D3 | P1 query = Mongo text/regex + categoryId + facets filters (no OpenSearch) |
| D4 | Events via IEventPublisher (`search.zero-result.recorded` when resultCount=0) |
| D5 | Apply-if-newer on upsert using sourceOccurredAt |
