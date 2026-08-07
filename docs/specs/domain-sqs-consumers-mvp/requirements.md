# Domain SQS Consumers MVP — Requirements

feature: domain-sqs-consumers-mvp
status: Approved
version: 0.1.0
owner: Product
jira: N/A
createdAt: 2026-08-07
updatedAt: 2026-08-07
approvedBy: Plan execution gate (Ralph loop E22)
approvedAt: 2026-08-07

Classification: Feature slice

## Related specifications

- docs/architecture/05-sqs-messaging.md
- docs/ralph/ledgers/loop-e22-domain-sqs-consumers.md

## Context

### Current situation

Producers call SearchDocumentService / SynonymService synchronously after publish/pause and taxonomy create/update. SQS consumer infra exists but domain handlers are not wired.

### Problem or opportunity

Cross-module side effects must travel via events so modules stay decoupled and the same handlers can run via SQS pollers or in-process dispatch (Jest without broker).

### Business impact

Enables async topology locally and in production without breaking Phase 1 integration tests.

## Objective

### OBJ-01 — Event-driven search and verification side effects

Listing status and catalog taxonomy events drive search reindex/delete, synonym projection, and verification case open via domain handlers.

## Actors

### ACT-01 — System (event consumer)

- Goal: apply idempotent projections from domain events
- Permissions: internal handlers only
- Relevant context: in-process or SQS

## User stories

### US-01 — Decouple producers from search/synonym

As the platform,
I want listing and catalog services to publish events only,
so that search/synonym/verification react through handlers.

## Business rules

### BR-01 — Search on listing status

Source: Decision E22

PUBLISHED → reindex listing search document; PAUSED / not PUBLISHED after unpublish → delete search document.

### BR-02 — Synonym projection from taxonomy

Source: Decision E22

On category/service created|updated, upsert synonym for name and each synonym term.

### BR-03 — Verification case on submit

Source: Decision E22

On listing SUBMITTED (status_changed or submitted), open verification case if none open (idempotent).

### BR-04 — Verification approved stub

Source: Decision E22

On verification.case.approved, listings handler is a no-op stub (E23 implements auto-publish).

### BR-05 — In-process dispatch default

Source: Decision E22 / DEC-053

When SQS_CONSUMERS_ENABLED is not true, EVENT_INPROCESS_DISPATCH defaults to true so Jest uses the same handlers without a broker. When consumers are enabled, in-process dispatch is off to avoid double-handle.

## Product flows

### FLOW-01 — Publish listing → search doc

1. ListingService.publishListing persists PUBLISHED and publishes events
2. DispatchingEventPublisher transports (or no-ops in test) then optionally dispatches in-process
3. Search handler reindexes listing

### FLOW-02 — Create category → synonyms

1. CategoryService.createCategory persists and publishes catalog.category.created
2. Taxonomy synonym handler upserts projections

## Acceptance criteria

### AC-01 — Search driven by events

Traceability: BR-01, US-01

Publishing a listing results in a search document via handler (in-process in tests), without ListingService calling SearchDocumentService directly.

### AC-02 — Synonyms driven by events

Traceability: BR-02

Creating a category projects synonyms via handler dispatch, without CategoryService calling SynonymService directly.

### AC-03 — Verification open on submit

Traceability: BR-03

Submitting a listing opens a verification case when none is open (idempotent on replay).

### AC-04 — Approved stub registered

Traceability: BR-04

Router registers listings handler for verification.case.approved; method returns without publishing.

### AC-05 — Same handlers for broker and in-process

Traceability: BR-05

DomainEventRouter.handle is used by SqsEventConsumer and by DispatchingEventPublisher when in-process is enabled.

## Non-functional

### NFR-01 — No broker in Jest

Suite never requires LocalStack/SQS (DEC-053).

### NFR-02 — Domain purity

Handlers and router live in domain; concrete SQS remains in infraestructure.

## Out of scope

- E23 auto-publish on verification approved
- OpenSearch
- Full multi-queue production IAM/alarms

## Approval

- Status: APPROVED
- Approved by: Plan execution gate (Ralph loop E22)
- Date: 2026-08-07
- Approved version: 0.1.0

## Changelog

### 0.1.0 — 2026-08-07

- Initial approved requirements for E22
