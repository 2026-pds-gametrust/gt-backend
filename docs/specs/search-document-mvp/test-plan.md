# SearchDocument MVP — Test plan

feature: search-document-mvp
status: Approved
version: 0.1.0

| ID | Level | Scenario | Expected |
|----|-------|----------|----------|
| T1 | int service | reindex published listing | document upserted |
| T2 | int service | deleteOnUnpublish | document removed |
| T3 | int controller | GET /search?q= | 200 with matching docs |

Naming: `describe('when …')` / `it('should …')`.
