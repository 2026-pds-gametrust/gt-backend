# TrustScore MVP — Test plan

feature: trust-score-mvp
status: Approved
version: 0.1.0

| ID | Level | Scenario | Expected |
|----|-------|----------|----------|
| T1 | int service | recompute after seal event | score += 20 |
| T2 | int service | get missing seller | score 0 default |
| T3 | int service | publish trust.score.updated | spy called |

Naming: `describe('when …')` / `it('should …')`.
