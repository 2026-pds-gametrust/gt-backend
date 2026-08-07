# TrustScore

status: APPROVED
phase: 1
module: `trust`
collection: `trust_scores`
loopOrder: 14
kind: aggregate
dependencies: trust-event

## Summary

Explainable seller score = deterministic recompute over trust_events.

## Sources

- [ARCH-002 Module map](../../architecture/02-module-map.md)
- [ARCH-008 Glossary](../../architecture/08-glossary.md)
- Product: `context/GamerTrust-*`

## Notes

Eventual but reproducible.

## Files

- [interface.md](interface.md)
- [behavior.md](behavior.md)
- [relationships.md](relationships.md)

## Ready for Ralph Loop

- [ ] Entity docs APPROVED (INDEX gate)
- [ ] Specs under `docs/specs/trust-score-mvp/`
- [ ] No unresolved dependency entities ahead in loop order
