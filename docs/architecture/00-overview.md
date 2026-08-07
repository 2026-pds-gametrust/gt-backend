# Architecture Overview — GamerTrust Backend

feature: architecture-canon
doc: ARCH-000
status: Approved
version: 0.1.1
owner: Architecture
jira: N/A
createdAt: 2026-08-07
updatedAt: 2026-08-07
approvedBy: Plan execution gate (Ralph Loops Fase 1)
approvedAt: 2026-08-07

## Purpose and audience

This folder is the **project-level technical specification** of the GamerTrust backend: a modular monolith built on this repository's layered boilerplate, using MongoDB/Mongoose, MongoDB Atlas Vector Search (RAG), and AWS SQS/SNS for asynchronous communication.

Audience:

- **Developers** (human or agent) implementing features.
- **Review agents** (`agt-architecture-review`, `agt-code-review`, `agt-verifier`) tracing findings back to recorded decisions.
- **Spec authors** (`agt-product-owner`, `agt-architecture`) citing constraints in `docs/specs/<feature-slug>/` artifacts.

Product context (pt-BR, read-only input): `context/GamerTrust-00..08`. Product terms used in English here are mapped in [08-glossary.md](08-glossary.md).

## Relationship to kit canon

- [`AGENTS.md`](../../AGENTS.md) and [`docs/architecture-and-layers.md`](../architecture-and-layers.md) define the **generic layer rules** (Domain / Application / Infraestructure / Configuration, naming, tests).
- `docs/architecture/*` (this folder) defines the **GamerTrust-specific rules**: module boundaries, communication, messaging transport, consistency, RAG, security.
- This folder **extends and never contradicts** the kit canon. A conflict between the two is a documentation bug — route it to the Architecture owner; do not resolve it silently in code.

## Document map

| Doc | ID | Scope | Status |
|-----|----|-------|--------|
| [00-overview.md](00-overview.md) | ARCH-000 | Entry point, decision registry, conventions | Draft |
| [01-modular-monolith.md](01-modular-monolith.md) | ARCH-001 | Module = bounded context, no-coupling rules, enforcement, coding standards addendum | Draft |
| [02-module-map.md](02-module-map.md) | ARCH-002 | Full module map (4 phases), data ownership, event/port catalogs | Draft |
| [03-inter-module-communication.md](03-inter-module-communication.md) | ARCH-003 | Sync client ports, domain events, envelope, idempotency, outbox policy | Draft |
| [04-persistence-and-consistency.md](04-persistence-and-consistency.md) | ARCH-004 | Mongoose conventions, transactions, sagas, consistency-critical flows | Draft |
| [05-sqs-messaging.md](05-sqs-messaging.md) | ARCH-005 | SQS/SNS transport standard, topology, DLQ, local dev | Draft |
| [06-rag-and-vector-search.md](06-rag-and-vector-search.md) | ARCH-006 | Atlas Search / Vector Search, embedding pipeline, RAG guardrails | Draft |
| [07-security.md](07-security.md) | ARCH-007 | Layer security, authN/Z, PII and evidence privacy, LGPD | Draft |
| [08-glossary.md](08-glossary.md) | ARCH-008 | EN↔PT product term glossary | Draft |

## Reading order per role

- **New developer**: 01 → 02 → 03 → 04 → 05, then 06/07 as the feature requires.
- **Feature spec author** (`agt-architecture`): 02 (does the module exist? who owns the data?) → 03 (how does it talk?) → constraints from 04–07; cite `ARCH-*/DEC-*` in `design.md` decision tables.
- **Review agents**: 01 §Enforcement, plus the DEC registry below as the traceability source.
- **QA** (`agt-quality-assurance`): 03 (idempotency contracts), 04 (consistency flows), 05 (messaging test doctrine).

## Decision registry

Global index of architecture decisions. Each `DEC-0xy` is defined in the doc owning it (x = doc number); the owning doc's `## Decisions` table is normative.

| ID | Decision (short) | Owning doc |
|----|------------------|------------|
| DEC-001 | Architecture canon lives in `docs/architecture/`; `context/` stays read-only product input | ARCH-000 |
| DEC-010 | Modules map to `<context>` folders inside the existing layer-first layout; no `src/modules/` restructure | ARCH-001 |
| DEC-011 | Module boundaries enforced by `eslint-plugin-boundaries` (fails `yarn lint`) + review agents | ARCH-001 |
| DEC-012 | `src/domain/common/` is the only shared kernel: errors, value types, event envelope — never services/repositories | ARCH-001 |
| DEC-013 | Single `src/contracts/service.yaml`; one OpenAPI tag and path prefix per module | ARCH-001 |
| DEC-020 | Product capabilities consolidate into 17 modules; dashboard/comparator are read-model compositions | ARCH-002 |
| DEC-021 | Phase-1 MVP-detailed modules: identity, catalog, listings, verification, trust, search, favorites | ARCH-002 |
| DEC-022 | Sync-port dependency graph must be acyclic; cycles are broken with events | ARCH-002 |
| DEC-023 | `price_history` owned by catalog in Phases 1–2; hand-off to pricing in Phase 3 | ARCH-002 |
| DEC-024 | Unique `categories` + `services` master data in catalog; synonyms on entities; global synonym uniqueness; `search.synonyms` is projection | ARCH-002 |
| DEC-030 | Inter-module sync calls are in-process client ports (interface in consumer domain, adapter in infra) — not HTTP loopback | ARCH-003 |
| DEC-031 | Event naming `<module>.<aggregate>.<past-tense-verb>`; `schemaVersion` in envelope; breaking changes dual-publish | ARCH-003 |
| DEC-032 | Consumers are idempotent by contract; dedupe store is per consuming module | ARCH-003 |
| DEC-033 | Outbox deferred: publish-after-commit + reconciliation in Phase 1; transactional outbox is a hard gate for Phase 2 money-path events | ARCH-003 |
| DEC-040 | No cross-module Mongo transactions, ever; cross-module invariants use sagas with compensation | ARCH-004 |
| DEC-041 | Unique-unit reservation = sync port + single-document conditional update | ARCH-004 |
| DEC-042 | TrustScore is a reproducible recompute over the append-only `trust_events` ledger | ARCH-004 |
| DEC-043 | Read models are disposable and rebuildable; each declares rebuild procedure and staleness budget | ARCH-004 |
| DEC-050 | Topology: SNS topic per event type → SQS queue per consumer module | ARCH-005 |
| DEC-051 | Standard queues by default; FIFO (`MessageGroupId = aggregateId`) only for `orders.*` / `payments.*` | ARCH-005 |
| DEC-052 | Domain messaging contracts are transport-neutral (`producer.interface.ts`); transport suffix only in infra (`producer.sqs.ts`) | ARCH-005 |
| DEC-053 | LocalStack for local dev; Jest never talks to a broker (spy on the injected interface) | ARCH-005 |
| DEC-060 | Vectors live on read-model collections owned by search/ai — never on owner modules' write collections | ARCH-006 |
| DEC-061 | Embedding provider abstracted behind a domain interface; model name + version stamped per document | ARCH-006 |
| DEC-062 | Local dev uses Atlas CLI local deployments; default Jest suite never requires Atlas Search | ARCH-006 |
| DEC-063 | Search/vector index definitions are versioned files in the repo, applied by script | ARCH-006 |
| DEC-070 | Authorization happens only in the application layer + Service ownership rules; domain never sees tokens | ARCH-007 |
| DEC-071 | Evidence media and proof codes are restricted-class data: private bucket, presigned URLs, hashed codes, log-forbidden | ARCH-007 |
| DEC-072 | Events must not carry PII; consumers needing personal data fetch via sync port with actor context | ARCH-007 |
| DEC-080 | English is normative for code/specs/docs; the glossary is the only sanctioned EN↔PT mapping | ARCH-008 |

## Metadata and traceability conventions

- Every doc in this folder carries the kit metadata header (`feature: architecture-canon`, `doc: ARCH-00x`, `status`, `version`, dates, approvals) — read and preserve it, never drop it.
- Approval uses the kit gate vocabulary: `APPROVED | CHANGES_REQUESTED | REJECTED | BLOCKED`. Only an explicit gate changes `status`.
- Feature specs under `docs/specs/<feature-slug>/` cite constraints as `ARCH-003 / DEC-030` in their decision and requirements-coverage tables. Review agents use those citations to trace code findings back to recorded decisions.
- Each doc ends with `## Decisions`, `## Approval`, and `## Changelog` sections so `agt-verifier` can gate them exactly like specs.

## Follow-up implementation register

Recorded here so this delivery stays documentation-only; each item becomes a feature spec / task when picked up:

| Item | Source decision | Status |
|------|-----------------|--------|
| Add `eslint-plugin-boundaries` config to `eslint.config.mjs` | DEC-011 | Done |
| Add `@aws-sdk/client-sqs` + `@aws-sdk/client-sns` (infra only) | DEC-050 | Pending |
| LocalStack (SNS+SQS) service in docker-compose for local dev | DEC-053 | Done |
| Atlas CLI local deployment script for search/vector dev | DEC-062 | Pending |
| Search/vector index definition files + apply script | DEC-063 | Pending |
| Reconciliation job for listing ↔ search read model | DEC-033 / DEC-043 | Pending |

## Decisions

| ID | Decision | Chosen | Rejected alternatives | Status |
|----|----------|--------|-----------------------|--------|
| DEC-001 | Where the project technical specification lives | `docs/architecture/` numbered docs; `context/` stays read-only pt-BR product input | `docs/specs/project-foundation/` (SDD pipeline overhead for a living canon); scattering into kit docs | Approved |

## Approval

- Gate: APPROVED
- Approver: Plan execution gate (Ralph Loops Fase 1)
- Date: 2026-08-07
- Loop 01a: COMPLETED — DEC-024 registered (unique `categories` + `services` with synonyms).

## Changelog

| Version | Date | Change |
|---------|------|--------|
| 0.1.1 | 2026-08-07 | Loop 01a: DEC-024 taxonomy registry entry; gate APPROVED |
| 0.1.0 | 2026-08-07 | Initial draft of the architecture canon set (ARCH-000..008) |
