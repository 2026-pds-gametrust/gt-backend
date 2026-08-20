# Favorite

status: APPROVED
phase: 1
module: `favorites`
collection: `favorites`
loopOrder: 19
kind: aggregate
dependencies: user + product|listing

## Summary

User-saved product or listing. Alerts/saved searches are Phase 2.

## Sources

- [ARCH-002 Module map](../../architecture/02-module-map.md)
- [ARCH-008 Glossary](../../architecture/08-glossary.md)
- Product: `context/GamerTrust-*`

## Notes

P2: saved_searches, alerts.

## Files

- [interface.md](interface.md)
- [behavior.md](behavior.md)
- [relationships.md](relationships.md)

## Ready for Ralph Loop

- [ ] Entity docs APPROVED (INDEX gate)
- [ ] Specs under `docs/specs/favorite-mvp/`
- [ ] No unresolved dependency entities ahead in loop order
