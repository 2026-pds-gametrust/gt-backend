# VerificationCase MVP — Test plan

feature: verification-case-mvp
status: Approved
version: 0.1.0

| ID | Level | Scenario | Expected |
|----|-------|----------|----------|
| T1 | int service | open case | PENDING persisted |
| T2 | int service | missing listing | 404 |
| T3 | int service | assign then approve | APPROVED + seal + events |
| T4 | int service | invalid transition | 409 |
| T5 | int service | reject without reason | 400 |
| T6 | int controller | POST /verification-cases | 201 |

Naming: `describe('when …')` / `it('should …')`.
