# Entity catalog — GamerTrust Backend

Normative **domain entity catalog** for Phase 1. Extends architecture canon ([`docs/architecture/`](../architecture/)); does not replace it.

## Purpose

- Define each entity’s interface, domain behavior, and relationships **before** Ralph Loops implement code.
- Keep English identifiers normative ([ARCH-008 / DEC-080](../architecture/08-glossary.md)).
- Align ownership with [ARCH-002](../architecture/02-module-map.md).
- Enrich interfaces using marketplace benchmarks: [Pichau + Mercado Livre notes](_references/marketplace-benchmarks.md).

## Layout

```text
docs/entities/
  README.md
  INDEX.md
  _templates/entity.md
  <entity-slug>/
    README.md
    interface.md
    behavior.md
    relationships.md
```

## Conventions

| Rule | Detail |
|------|--------|
| One folder per entity | Slug = EN kebab-case from glossary |
| Ownership | Exactly one module + one collection (or read-model note) |
| Business rules | Described as Service rules; Entity = local invariants only |
| Cross-module access | Sync ports or events only — never direct repo/model imports |
| Status | `DRAFT` → `APPROVED` via explicit gate on INDEX |
| Specs | Feature delivery lives in `docs/specs/<slug>/` after entity APPROVED |
| Code | `src/domain/<module>/` only after entity APPROVED and its Ralph Loop starts |

## Reading order

1. [INDEX.md](INDEX.md) — inventory and loop order  
2. Entity folder — interface → behavior → relationships  
3. Cite `ARCH-*` / `DEC-*` when implementing  

## Phase scope

- **Phase 1:** full folders (see INDEX).  
- **Phase 2–4:** INDEX stubs only until scheduled.
