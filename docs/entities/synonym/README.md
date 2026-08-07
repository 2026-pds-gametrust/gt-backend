# Synonym

status: APPROVED
phase: 1
module: `search`
collection: `synonyms`
loopOrder: 17
kind: projection
dependencies: category/service events

## Summary

Operational synonym map projected from catalog master data (DEC-024). Not the edit surface.

## Sources

- [ARCH-002 Module map](../../architecture/02-module-map.md)
- [ARCH-008 Glossary](../../architecture/08-glossary.md)
- Product: `context/GamerTrust-*`

## Notes

Source of truth remains catalog synonyms[].

## Files

- [interface.md](interface.md)
- [behavior.md](behavior.md)
- [relationships.md](relationships.md)

## Ready for Ralph Loop

- [ ] Entity docs APPROVED (INDEX gate)
- [ ] Specs under `docs/specs/synonym-mvp/`
- [ ] No unresolved dependency entities ahead in loop order
