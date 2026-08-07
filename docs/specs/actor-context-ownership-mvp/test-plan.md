# Test Plan — ActorContext Ownership MVP

feature: actor-context-ownership-mvp
status: Approved
version: 0.1.0
owner: Quality Assurance
jira: N/A
createdAt: 2026-08-07
updatedAt: 2026-08-07
approvedBy: Plan execution gate (Ralph loop E24)
approvedAt: 2026-08-07

Requirements: docs/specs/actor-context-ownership-mvp/requirements.md (version 0.1.0)
Design: docs/specs/actor-context-ownership-mvp/design.md

## Scope

### In scope

- Integration: listing create/submit with `x-user-id` as seller
- Integration: favorites create with actor-forced userId
- Integration: profile create as backoffice (existing) + ownership regression
- Regression: messaging auto-publish / domain-event consumers
- Service-level listing tests updated to pass `IActorContext`

### Out of scope

- Full auth matrix for every route
- JWT parsing

## Quality risks

| Risk | Impact | Probability | Priority | Coverage |
|---|---:|---:|---:|---|
| Seller HTTP breaks without x-user-id | High | High | P0 | TC-01 |
| Body userId spoofing on favorites | High | Medium | P0 | TC-02 |
| Auto-publish blocked by publish auth | High | Medium | P0 | TC-03 / messaging int |
| Profile admin path regresses | Medium | Low | P1 | identity int |

## Test strategy

### Infrastructure integration

- HTTP via supertest + headers
- Service factory calls with explicit actor

### Regression

- `yarn test:int`

## Test matrix

| ID | Traceability | Scenario | Level | Priority | Automation | Status |
|---|---|---|---|---|---|---|
| TC-01 | AC-02, AC-06 | listing create/submit with seller x-user-id | Integration | P0 | Automated | Planned |
| TC-02 | AC-04 | favorite create uses actor userId | Integration | P0 | Automated | Planned |
| TC-03 | AC-03 | approve → PUBLISHED still works | Integration | P0 | Automated | Planned |
| TC-04 | AC-05 | profile create with backoffice groups + x-user-id | Integration | P1 | Automated | Planned |

## Detailed test cases

### TC-01 — Listing seller HTTP flow

Traceability: AC-02, BR-03

Priority: P0  
Level: Integration  
Test file: `src/__tests__/integration/listings/controller/listing.int.test.ts`

Given: seeded seller + product  
When: POST /listings and submit with `x-user-id` = sellerId  
Then: 201 then SUBMITTED  

### TC-02 — Favorite actor userId

Traceability: AC-04, BR-05

Priority: P0  
Level: Integration  
Test file: `src/__tests__/integration/favorites/controller/favorite.int.test.ts`

Given: user + product  
When: POST /favorites with `x-user-id` = user.id (body may omit or differ)  
Then: created.userId === user.id  

### TC-03 — System auto-publish

Traceability: AC-03, BR-04

Priority: P0  
Level: Integration  
Test file: `src/__tests__/integration/messaging/domain-event-consumers.int.test.ts`

Given: submitted listing + open case  
When: approveCase  
Then: listing PUBLISHED  

### TC-04 — Profile backoffice create

Traceability: AC-05, BR-06

Priority: P1  
Level: Integration  
Test file: `src/__tests__/integration/identity/controller/identity-http.int.test.ts`

Given: user  
When: POST /profiles with backoffice groups + x-user-id  
Then: 201  

## Architecture validations

- [x] Domain does not import Infraestructure
- [x] Ownership in Service
- [x] Middleware only builds ActorContext
- [x] Tests under `src/__tests__` with when/should

## Commands

| Purpose | Command | Required |
|---|---|---|
| Full int | `yarn test:int` | Yes |

## Entry criteria

- [x] Requirements approved
- [x] Design approved

## Exit criteria

- [ ] All P0 automated tests pass
- [ ] `yarn test:int` green

## Assumptions

- `EUserGroup.BACKOFFICE` / `ADMIN` string values match authorizeByGroup
- SYSTEM is a logical group string for internal publish only

## Blockers

- none

## Changelog

### 0.1.0 — 2026-08-07

- Initial approved test plan for E24
