# QueryLog MVP — Requirements

feature: query-log-mvp
status: Approved
version: 0.1.0
owner: Product
createdAt: 2026-08-07
updatedAt: 2026-08-07
approvedBy: Plan execution gate (entity loop E18)
approvedAt: 2026-08-07

## Objective

OBJ-01 — Append search observability logs on each search request without excess PII.

## Scope

- Append QueryLog on each GET `/search` (query, filters, resultCount, optional actorId/userId)
- No PII beyond optional userId

## Out of scope

- Retention purge jobs
- Public QueryLog API

## Acceptance criteria

- AC-01: Every search appends a query_logs row
- AC-02: Zero-result searches still append with resultCount=0
- AC-03: Payload stores only query/filters/resultCount/actorId

## Entity source

docs/entities/query-log/
