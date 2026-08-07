# Listing Event MVP — Test plan

feature: listing-event-mvp
status: Approved
version: 0.1.0

| ID | Level | Scenario | Expected |
|----|-------|----------|----------|
| T1 | int service | happy path | success |
| T2 | int service | key conflict / not found | 409 or 404 |
| T3 | int controller | HTTP happy path | 2xx |

Naming: `describe('when …')` / `it('should …')`.
