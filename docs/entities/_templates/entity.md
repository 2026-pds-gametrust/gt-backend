# Entity documentation template

Copy into `docs/entities/<entity-slug>/` as four files. Keep English normative.

---

## README.md

```md
# <EntityName>

status: DRAFT | APPROVED
phase: 1 | 2 | 3 | 4
module: <module-slug>
collection: <snake_case>
loopOrder: <n>
kind: aggregate | entity | read-model | projection | ledger

## Summary
One paragraph.

## Sources
- ARCH-002, glossário, context/…

## Files
- [interface.md](interface.md)
- [behavior.md](behavior.md)
- [relationships.md](relationships.md)

## Ready for Ralph Loop
Checklist before implementation loop starts.
```

---

## interface.md

```md
# <EntityName> — Interface

## Domain type
`I<EntityName>`

## Fields
| Field | Type | Required | Notes |
|-------|------|----------|-------|

## Local invariants (Entity)
- …

## Enums
- `E<Entity>Status` = …
```

---

## behavior.md

```md
# <EntityName> — Behavior

## Service responsibilities
- Uniqueness, 404/409, workflows

## State machine (if any)
| From | To | Trigger | Guard |

## Errors
| Condition | HTTP | EErrorCode |

## Idempotency
- …
```

---

## relationships.md

```md
# <EntityName> — Relationships

## References (ids)
| Field | Target entity | Cardinality |

## Sync ports (this module exposes / consumes)
| Port | Direction | Consumer/Supplier |

## Domain events
| Event | Direction | Payload facts |

## Read models / projections
- …
```
