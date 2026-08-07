# Ralph Loops — GamerTrust Backend

Execution ledger system for Phase 1. Coordinated by `agt-orchestrator`.

## Rules

1. One loop at a time; finish and validate before the next.
2. Status `COMPLETED` only when scope, acceptance criteria, validations, agent consolidation, and this ledger are done.
3. Do not silently expand scope; new needs become a new loop.
4. Do not change files outside the loop scope.
5. Preserve architecture decisions (`docs/architecture/`) unless an explicit delta loop says otherwise.

## Ledger path

`docs/ralph/ledgers/loop-<numero>-<nome>.md`

Use [`_templates/ledger.md`](_templates/ledger.md).

## Index

See [`INDEX.md`](INDEX.md).
