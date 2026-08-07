# QueryLog MVP — Design

feature: query-log-mvp
status: Approved
version: 0.1.0

## Citations

- docs/entities/query-log/*

## Placement

| Concern | Layer |
|---------|-------|
| IQueryLog | domain/search |
| Append | QueryLogService (called from SearchDocumentService.search) |
| Mongo `query_logs` | infraestructure |

## Decisions

| ID | Decision |
|----|----------|
| D1 | Collection `query_logs`; append-only |
| D2 | actorId optional; no other PII |
| D3 | Zero-result also publishes `search.zero-result.recorded` via IEventPublisher |
