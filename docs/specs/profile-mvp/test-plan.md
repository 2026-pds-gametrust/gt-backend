# Profile MVP — Test plan

feature: profile-mvp
status: Approved
version: 0.1.0

| ID | Level | Scenario | Expected |
|----|-------|----------|----------|
| T1 | int service | create profile with address for existing user | persisted |
| T2 | int service | create when user missing | 404 |
| T3 | int service | duplicate userId | 409 |
| T4 | int controller | POST /profiles | 201 |

Naming: `describe('when …')` / `it('should …')`.
