# Listing MVP — Design

feature: listing-mvp
status: Approved
version: 0.1.0

## Citations

- docs/entities/listing/*
- ARCH-002 module map

## Placement

| Concern | Layer |
|---------|-------|
| I* + entity invariants | domain |
| Uniqueness / transitions / existence | *Service |
| Mongo collection | infraestructure |
| HTTP | Controller + service.yaml |

## Decisions

| ID | Decision |
|----|----------|
| D1 | Collection names per module map |
| D2 | Events via IEventPublisher; no PII in payloads |
| D3 | Phase 1 publish listing without verification consumer (backoffice) |
