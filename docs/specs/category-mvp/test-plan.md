# Category MVP — Test plan

feature: category-mvp
status: Approved
version: 0.1.0

| ID | Level | Scenario | Expected |
|----|-------|----------|----------|
| T1 | int service | create unique category | 201-equivalent return + persisted |
| T2 | int service | duplicate slug | 409 RESOURCE_CONFLICT |
| T3 | int service | duplicate synonym | 409 RESOURCE_CONFLICT |
| T4 | int service | get missing | 404 |
| T5 | int service | create publishes event | spy called |
| T6 | int controller | POST /categories | 201 |

Naming: `describe('when …')` / `it('should …')`.
