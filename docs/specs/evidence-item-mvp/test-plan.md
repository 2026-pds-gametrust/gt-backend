# EvidenceItem MVP — Test plan

feature: evidence-item-mvp
status: Approved
version: 0.1.0

| ID | Level | Scenario | Expected |
|----|-------|----------|----------|
| T1 | int service | add evidence | persisted |
| T2 | int service | missing case | 404 |
| T3 | int controller | POST evidence | 201 |

Naming: `describe('when …')` / `it('should …')`.
