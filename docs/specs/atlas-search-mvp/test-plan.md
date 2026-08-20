# Test Plan — Atlas Search MVP

feature: atlas-search-mvp
status: Approved
version: 0.1.0
owner: Quality Assurance
jira: N/A
createdAt: 2026-08-07
updatedAt: 2026-08-07
approvedBy: Plan execution gate (Ralph loop E25)
approvedAt: 2026-08-07

Requirements: docs/specs/atlas-search-mvp/requirements.md (version 0.1.0)
Design: docs/specs/atlas-search-mvp/design.md

## Scope

### In scope

- Integration: existing search service int tests with `SEARCH_ENGINE=mongo`
- Unit: synonym expansion delegates expanded `q` to `ISearchEngine`
- Regression: `yarn test:int`

### Out of scope

- Live Atlas `$search` suite (`*.atlas.test.ts`)
- Fuzzy/typo tuning assertions

## Quality risks

| Risk | Impact | Probability | Priority | Coverage |
|---|---:|---:|---:|---|
| Int tests break without Atlas | High | High | P0 | TC-01 |
| Synonym expansion skipped | Medium | Medium | P1 | TC-02 |
| QueryLog regression | Medium | Low | P1 | TC-01 |

## Test matrix

| ID | Traceability | Scenario | Level | Priority | Automation | Status |
|---|---|---|---|---|---|---|
| TC-01 | AC-01, AC-03, NFR-01 | search + query log with mongo engine | Integration | P0 | Automated | Planned |
| TC-02 | AC-02 | synonym expansion calls engine with appended terms | Unit | P1 | Automated | Planned |

## Detailed test cases

### TC-01 — Search with mongo engine

Traceability: AC-01, AC-03

Priority: P0  
Level: Integration  
Test file: `src/__tests__/integration/search/service/search.int.test.ts`

Given: published search document  
When: `searchDocumentService.search({ q })`  
Then: matches returned and QueryLog appended  

### TC-02 — Synonym expansion

Traceability: AC-02

Priority: P1  
Level: Unit  
Test file: `src/__tests__/unit/search/service/search-document-synonym-expansion.unit.test.ts`

Given: synonym service returns canonical/normalized match  
When: `search` with `q`  
Then: `searchEngine.search` called with expanded `q` containing those terms  

## Commands

| Purpose | Command | Required |
|---|---|---|
| Full int | `yarn test:int` | Yes |
| Unit (synonym) | `yarn test:unit -- search-document-synonym` | Yes |

## Exit criteria

- [ ] TC-01 / TC-02 pass
- [ ] `yarn test:int` green

## Changelog

### 0.1.0 — 2026-08-07

- Initial approved test plan for E25
