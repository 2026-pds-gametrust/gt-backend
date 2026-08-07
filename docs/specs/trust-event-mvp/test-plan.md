# TrustEvent MVP — Test plan

feature: trust-event-mvp
status: Approved
version: 0.1.0

| ID | Level | Scenario | Expected |
|----|-------|----------|----------|
| T1 | int service | append | persisted |
| T2 | int service | duplicate sourceEventId | same event returned |
| T3 | int controller | POST /trust-events | 201 |

Naming: `describe('when …')` / `it('should …')`.
