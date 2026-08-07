# Modular Monolith Rules — GamerTrust Backend

feature: architecture-canon
doc: ARCH-001
status: Approved
version: 0.1.0
owner: Architecture
jira: N/A
createdAt: 2026-08-07
updatedAt: 2026-08-07
approvedBy: Plan execution gate (Ralph Loops Fase 1)
approvedAt: 2026-08-07

Extends the kit layer rules ([AGENTS.md](../../AGENTS.md), [docs/architecture-and-layers.md](../architecture-and-layers.md)) with **module** rules. Layers say *where code lives*; this doc says *what code may know about other modules*.

## Module definition

- A **module** is a bounded context, identified by its `<context>` slug (e.g. `listings`, `trust`). The authoritative module list is [02-module-map.md](02-module-map.md).
- A module owns its **data** (collections — one owner per collection), its **business rules** (domain services), and its **contracts** (REST paths, events, client ports).
- The system deploys as **one process** (single Express app, single Mongo database). Modularity is a source-code and contract discipline, not a deployment topology — but every rule here is written so that extracting a module into a service later is an infrastructure change, not a domain rewrite.

## Module-to-folder mapping

Modules live **inside** the kit's layer-first layout — there is no `src/modules/` restructure (DEC-010). For module `listings`:

```text
src/domain/listings/                       # entities, services, repo contracts, client ports, messaging contracts
src/application/controllers/listings.controller.ts
src/infraestructure/repository/listings/   # concrete repos + adapters
src/infraestructure/db/mongo/{interfaces,schema,models}/listings.*
src/infraestructure/client/listings/       # in-process adapters exposing listings to consumers (see ARCH-003)
src/infraestructure/messaging/<event>/     # concrete producers/consumers (see ARCH-005)
src/configuration/factory/listings.{service,controller}.factory.ts
src/configuration/factory/client/          # client-port factories
src/configuration/factory/messaging/       # messaging factories
src/__tests__/integration/listings/…       # mirrored tests
```

The canonical `user` context is absorbed by the `identity` module (`identity` extends it — see [02](02-module-map.md)).

## The no-coupling rule

A module must not reach inside another module. Concretely:

**Forbidden**

- `src/domain/<A>/**` importing anything from `src/domain/<B>/**` (any other context).
- Any module importing another module's concrete repositories (`src/infraestructure/repository/<B>/**`) or Mongo artifacts (`src/infraestructure/db/mongo/**/<B>.*`).
- Two modules writing to the same collection (ownership table in [02](02-module-map.md) is normative).
- A controller calling another module's service directly (`listings.controller.ts` must never receive `TrustService`).
- "Utility" modules that accumulate business logic shared across contexts.

**Allowed**

- Importing from `src/domain/common/` (shared kernel — see below).
- Consuming another module through its **public surface** (next section).
- Infra adapters in `src/infraestructure/client/<supplier>/` importing the *supplier's* domain service interface — that is the one sanctioned crossing point, wired by factories ([03 §Sync](03-inter-module-communication.md)).

## Module public surface

A module exposes exactly three surfaces; everything else is private:

1. **REST endpoints** — declared in `src/contracts/service.yaml` under the module's tag and path prefix (external clients: web/app/BFF).
2. **Domain events** — published per the catalog in [02](02-module-map.md), envelope and naming per [03](03-inter-module-communication.md), transport per [05](05-sqs-messaging.md).
3. **Client ports** — in-process request/response contracts for other modules, DTOs mirroring the supplier's OpenAPI schemas ([03 §Sync](03-inter-module-communication.md)).

If a capability is not reachable through one of these, other modules must not use it.

## Shared kernel (`src/domain/common/`)

The only code shared between modules (DEC-012). Whitelist:

- `errors/` — `EErrorCode`, `IThrowedError` (kit pattern).
- `messaging/` — the event envelope type and `IEventPublisher` ([03](03-inter-module-communication.md)).
- `types/` — primitive value types used across contracts (e.g. `Money`, `ActorContext`, pagination types).

Never in the shared kernel: services, repositories, entities with business rules, module-specific DTOs. If two modules "need" shared business logic, one of them owns it and the other consumes it via port or event.

## Enforcement

Three lines of defense (DEC-011):

1. **Lint (automated)** — `eslint-plugin-boundaries` in `eslint.config.mjs`, one element per `src/domain/<context>`, denying cross-context imports; `yarn lint` is already in the Definition of Done, so a boundary violation fails the DoD. Config sketch (implementation follow-up, tracked in [00](00-overview.md)):

   ```js
   // eslint.config.mjs (sketch)
   settings: {
     'boundaries/elements': [
       { type: 'domain-module', pattern: 'src/domain/(!(common))*', capture: ['module'] },
       { type: 'domain-common', pattern: 'src/domain/common/*' },
       { type: 'infra-client', pattern: 'src/infraestructure/client/*', capture: ['module'] },
     ],
   },
   rules: {
     'boundaries/element-types': ['error', {
       default: 'disallow',
       rules: [
         { from: 'domain-module', allow: ['domain-common'] },
         { from: 'domain-module', allow: [['domain-module', { module: '${from.module}' }]] },
         { from: 'infra-client', allow: ['domain-module', 'domain-common'] }, // supplier side only
       ],
     }],
   }
   ```

2. **Review agents** — `agt-architecture-review` and `agt-code-review` treat any cross-module import as `BLOCKING_ARCHITECTURE`, citing `ARCH-001 / DEC-010..012`.
3. **Spec gate** — `design.md` for any feature touching two modules must name the port/event used; a design that couples modules directly gets `CHANGES_REQUESTED`.

## Coding standards addendum

Complements [AGENTS.md §4](../../AGENTS.md); same conventions, module-scoped:

| Concern | Standard |
|---------|----------|
| Error codes | Per-module prefix in `EErrorCode`: `LISTING_NOT_FOUND`, `TRUST_SCORE_UNAVAILABLE` — no generic `RESOURCE_*` for module-specific failures beyond the kit's base set |
| OpenAPI | One tag per module (`Listings`, `Search`), path prefix per module (`/listings`, `/search`); single `service.yaml` (DEC-013) |
| Controllers | Exactly one controller file per module: `src/application/controllers/<module>.controller.ts` |
| Client ports | Interface `I<Supplier>Client` in consumer's `src/domain/<consumer>/client/`; adapter `<supplier>.client.inprocess.ts` in `src/infraestructure/client/<supplier>/`; factory in `src/configuration/factory/client/` |
| Messaging | Contracts/naming per [03](03-inter-module-communication.md) + [05](05-sqs-messaging.md) |
| Events state history | Aggregates with lifecycles keep an events/history collection owned by the same module (e.g. `listing_events`) |
| Module docs | No per-module README; this folder + `docs/specs/` are the source of truth |

## Decisions

| ID | Decision | Chosen | Rejected alternatives | Status |
|----|----------|--------|-----------------------|--------|
| DEC-010 | Module ↔ folder mapping | Modules are `<context>` folders inside the existing layer-first layout | `src/modules/<m>/{domain,application,…}` restructure (breaks every kit rule, agent, and skill path) | Draft |
| DEC-011 | Boundary enforcement | `eslint-plugin-boundaries` failing `yarn lint` + review agents + spec gate | Convention-only (won't survive multi-agent development); custom import scripts in CI (duplicate of what eslint does) | Draft |
| DEC-012 | Shared code between modules | `src/domain/common/` whitelist: errors, value types, event envelope | Shared `utils/` with open scope (coupling backdoor); duplicating envelope/error types per module | Draft |
| DEC-013 | OpenAPI layout | Single `src/contracts/service.yaml`, one tag + path prefix per module | Per-module YAML files (kit rule 6 and validator assume one file; unnecessary churn for a monolith) | Draft |

## Approval

- Gate: APPROVED
- Approver: Plan execution gate (Ralph Loops Fase 1)
- Date: 2026-08-07

## Changelog

| Version | Date | Change |
|---------|------|--------|
| 0.1.0 | 2026-08-07 | Initial modular-monolith rule set |
