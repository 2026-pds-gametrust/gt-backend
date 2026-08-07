# Seal MVP — Test plan

feature: seal-mvp
status: Approved
version: 0.1.0

| ID | Level | Scenario | Expected |
|----|-------|----------|----------|
| T1 | int service | grant on approve | GRANTED seal |
| T2 | int service | duplicate active | 409 |
| T3 | int service | revoke | REVOKED + event |

Naming: `describe('when …')` / `it('should …')`.
