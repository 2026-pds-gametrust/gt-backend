# VerificationCase

status: APPROVED
phase: 1
module: `verification`
collection: `verification_cases`
loopOrder: 10
kind: aggregate
dependencies: listing

## Summary

Review unit for a listing: evidence + checklist + decision (human-in-the-loop).

## Sources

- [ARCH-002 Module map](../../architecture/02-module-map.md)
- [ARCH-008 Glossary](../../architecture/08-glossary.md)
- Product: `context/GamerTrust-*`

## Notes

Prefer facts from event payload over sync on hot path.

## Files

- [interface.md](interface.md)
- [behavior.md](behavior.md)
- [relationships.md](relationships.md)

## Ready for Ralph Loop

- [ ] Entity docs APPROVED (INDEX gate)
- [ ] Specs under `docs/specs/verification-case-mvp/`
- [ ] No unresolved dependency entities ahead in loop order
