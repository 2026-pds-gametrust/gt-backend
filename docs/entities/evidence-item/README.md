# EvidenceItem

status: APPROVED
phase: 1
module: `verification`
collection: `evidence_items`
loopOrder: 11
kind: entity
dependencies: verification-case

## Summary

Restricted media/proof artifact for a case. Raw media never public (DEC-071).

## Sources

- [ARCH-002 Module map](../../architecture/02-module-map.md)
- [ARCH-008 Glossary](../../architecture/08-glossary.md)
- Product: `context/GamerTrust-*`

## Notes

Public surface uses Evidence summary DTO only.

## Files

- [interface.md](interface.md)
- [behavior.md](behavior.md)
- [relationships.md](relationships.md)

## Ready for Ralph Loop

- [ ] Entity docs APPROVED (INDEX gate)
- [ ] Specs under `docs/specs/evidence-item-mvp/`
- [ ] No unresolved dependency entities ahead in loop order
