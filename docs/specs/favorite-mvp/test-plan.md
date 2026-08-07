# Favorite MVP — Test plan

feature: favorite-mvp
status: Approved
version: 0.1.0

| ID | Level | Scenario | Expected |
|----|-------|----------|----------|
| T1 | int controller | POST /favorites | 201 |
| T2 | int controller | duplicate POST | 409 |
| T3 | int controller | DELETE then GET | removed from list |

Naming: `describe('when …')` / `it('should …')`.
