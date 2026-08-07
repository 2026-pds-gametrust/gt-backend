# Synonym MVP — Test plan

feature: synonym-mvp
status: Approved
version: 0.1.0

| ID | Level | Scenario | Expected |
|----|-------|----------|----------|
| T1 | int service | upsertFromTaxonomy | synonym persisted |
| T2 | int controller | GET /synonyms?q= | 200 matching terms |

Naming: `describe('when …')` / `it('should …')`.
