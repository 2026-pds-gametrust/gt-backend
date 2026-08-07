# Test Plan — Verification Auto-Publish MVP

feature: verification-auto-publish-mvp
status: Approved
version: 0.1.0
owner: Quality Assurance
jira: N/A
createdAt: 2026-08-07
updatedAt: 2026-08-07
approvedBy: Plan execution gate (Ralph loop E23)
approvedAt: 2026-08-07

Requirements: docs/specs/verification-auto-publish-mvp/requirements.md (version 0.1.0)
Design: docs/specs/verification-auto-publish-mvp/design.md

## Scope

### In scope

- Integration: open/approve verification case → listing PUBLISHED via in-process dispatch
- Idempotent re-handle when already PUBLISHED
- Unit: router still invokes `applyVerificationApproved`
- Regression: `yarn test:int` (verification suites with DRAFT + approve must not break)

### Out of scope

- Real LocalStack broker in Jest
- HTTP publish auth matrix (unchanged)

## Quality risks

| Risk | Impact | Probability | Priority | Coverage |
|---|---:|---:|---:|---|
| Auto-publish not wired | High | Medium | P0 | TC-01 |
| Replay throws on PUBLISHED | High | Medium | P0 | TC-02 |
| DRAFT approve path throws | Medium | Medium | P0 | regression verification.int |

## Test strategy

### Domain unit

- Router → handler → `applyVerificationApproved` invoked

### Infrastructure integration

- Factory services + DispatchingEventPublisher in-process
- Assert listing status via ListingService / Mongo

### Regression

- `yarn test:int`

## Test matrix

| ID | Traceability | Scenario | Level | Priority | Automation | Status |
|---|---|---|---|---|---|---|
| TC-01 | AC-01 | submit → assign → approve → PUBLISHED | Integration | P0 | Automated | Planned |
| TC-02 | AC-02 | replay approved when PUBLISHED | Integration | P0 | Automated | Planned |
| TC-03 | AC-03 / AC-04 | router calls apply; HTTP path untouched | Unit / existing | P1 | Automated | Planned |

## Detailed test cases

### TC-01 — Approve publishes SUBMITTED listing

Traceability: AC-01, BR-01, BR-05

Priority: P0
Level: Integration
Automation: Automated
Test file: src/__tests__/integration/messaging/domain-event-consumers.int.test.ts

Given: seller + product + listing submitted (case opened via dispatch)  
When: assignReviewer + approveCase  
Then: listing status is PUBLISHED  

### TC-02 — Replay approved is idempotent

Traceability: AC-02, BR-02

Priority: P0
Level: Integration
Automation: Automated
Test file: src/__tests__/integration/messaging/domain-event-consumers.int.test.ts

Given: listing already PUBLISHED after approve  
When: router.handle fabricated `verification.case.approved` again  
Then: still PUBLISHED; no throw  

### TC-03 — Router invokes applyVerificationApproved

Traceability: AC-03 path registration

Priority: P1
Level: Unit
Automation: Automated
Test file: src/__tests__/unit/messaging/domain-event-router.unit.test.ts

Given: fabricated approved envelope  
When: router.handle  
Then: `applyVerificationApproved` called once  

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

## Entry criteria

- [x] Requirements approved
- [x] Design approved

## Exit criteria

- [ ] All P0 automated tests pass
- [ ] `yarn test:int` green

## Assumptions

- NODE_ENV=test disables SNS/SQS transport; in-process dispatch remains available

## Blockers

- none

## Changelog

### 0.1.0 — 2026-08-07

- Initial approved test plan for E23
