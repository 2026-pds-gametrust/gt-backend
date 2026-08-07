# Test Plan — Domain SQS Consumers MVP

feature: domain-sqs-consumers-mvp
status: Approved
version: 0.1.0
owner: Quality Assurance
jira: N/A
createdAt: 2026-08-07
updatedAt: 2026-08-07
approvedBy: Plan execution gate (Ralph loop E22)
approvedAt: 2026-08-07

Requirements: docs/specs/domain-sqs-consumers-mvp/requirements.md (version 0.1.0)
Design: docs/specs/domain-sqs-consumers-mvp/design.md

## Scope

### In scope

- Handler unit/int with fabricated envelopes
- Listing publish → search doc via in-process dispatch
- Category create → synonym projection via dispatch
- Listing submit → verification case open
- Router registration for verification.case.approved stub
- Regression: existing listing/catalog/search int suites

### Out of scope

- Real LocalStack broker in Jest
- E23 auto-publish behavior

## Quality risks

| Risk | Impact | Probability | Priority | Coverage |
|---|---:|---:|---:|---|
| Missing in-process → search/synonym gaps in tests | High | Medium | P0 | TC-01, TC-02 |
| Double-handle when consumers on | Medium | Low | P1 | TC-05 |
| Non-idempotent verification open | High | Medium | P0 | TC-03 |

## Test strategy

### Domain unit

- Fabricated envelopes → handler / router (when/should)

### Infrastructure integration

- Factory services with DispatchingEventPublisher (default in-process)

### Messaging

- Spy transport optional; assert side effects via Mongo models

### Configuration/wiring

- EventPublisherFactory returns DispatchingEventPublisher

### Regression

- `yarn test:int`

## Test matrix

| ID | Traceability | Scenario | Level | Priority | Automation | Status |
|---|---|---|---|---|---|---|
| TC-01 | AC-01 | publish → search doc via dispatch | Integration | P0 | Automated | Planned |
| TC-02 | AC-02 | category create → synonym via dispatch | Integration | P0 | Automated | Planned |
| TC-03 | AC-03 | submit → open verification case | Integration | P0 | Automated | Planned |
| TC-04 | AC-04 | approved stub no-op | Unit | P0 | Automated | Planned |
| TC-05 | AC-05, BR-05 | router handles fabricated status_changed | Unit | P0 | Automated | Planned |

## Detailed test cases

### TC-01 — Publish listing creates search document

Traceability: AC-01, BR-01

Priority: P0
Level: Integration
Automation: Automated
Test file: src/__tests__/integration/messaging/domain-event-consumers.int.test.ts

Given: seller + product + draft listing ready to publish  
When: submit + publish via ListingServiceFactory  
Then: SearchDocument exists for listingId  

### TC-02 — Category create projects synonyms

Traceability: AC-02, BR-02

Priority: P0
Level: Integration
Automation: Automated
Test file: src/__tests__/integration/messaging/domain-event-consumers.int.test.ts

Given: unique category with synonym  
When: createCategory via factory  
Then: SynonymModel has normalized terms for name + synonym  

### TC-03 — Submit opens verification case

Traceability: AC-03, BR-03

Priority: P0
Level: Integration
Automation: Automated
Test file: src/__tests__/integration/messaging/domain-event-consumers.int.test.ts

Given: draft listing with photos/shipping  
When: submitListing  
Then: open verification case exists for listingId; second handler call is idempotent  

### TC-04 — Verification approved stub

Traceability: AC-04

Priority: P0
Level: Unit
Automation: Automated
Test file: src/__tests__/unit/messaging/domain-event-router.unit.test.ts

Given: fabricated verification.case.approved envelope  
When: router.handle  
Then: resolves without throw / without requiring listing publish  

### TC-05 — Search handler on status_changed PUBLISHED

Traceability: AC-05, BR-01

Priority: P0
Level: Unit/Integration
Automation: Automated
Test file: unit + int messaging suites

Given: fabricated envelope status_changed toStatus=PUBLISHED  
When: handler.handle  
Then: reindexListing invoked (unit spy) or document present (int)

## Architecture validations

- [x] Domain does not import Infraestructure
- [x] Controller remains thin
- [x] Repository contains no product-level decision
- [x] Factories only compose dependencies
- [x] Messaging interface in Domain; SQS in Infraestructure
- [x] Tests under `src/__tests__`

## Commands

| Purpose | Command | Required |
|---|---|---|
| Targeted | `yarn test:int -- domain-event` / `yarn test:unit -- domain-event` | Yes |
| Full int | `yarn test:int` | Yes |
| Lint | `yarn lint` on touched files | Yes |

## Entry criteria

- [x] Requirements approved
- [x] Design approved

## Exit criteria

- [ ] All P0 automated tests pass
- [ ] `yarn test:int` green
- [ ] Residual: LocalStack smoke optional outside Jest

## Assumptions

- NODE_ENV=test disables SNS/SQS transport; in-process dispatch remains available

## Blockers

- none

## Changelog

### 0.1.0 — 2026-08-07

- Initial approved test plan for E22
