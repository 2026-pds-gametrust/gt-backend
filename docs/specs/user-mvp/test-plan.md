# User MVP — Test plan

feature: user-mvp
status: Approved
version: 0.1.0

| ID | Level | Scenario | Expected |
|----|-------|----------|----------|
| T1 | int service | create unique user | persisted + returned |
| T2 | int service | duplicate email | 409 RESOURCE_CONFLICT |
| T3 | int service | duplicate cpf | 409 RESOURCE_CONFLICT |
| T4 | int service | underage birthDate | 400 USER_UNDERAGE |
| T5 | int service | create publishes event | spy; no cpf in payload |
| T6 | int controller | POST /users | 201 |

Naming: `describe('when …')` / `it('should …')`.
