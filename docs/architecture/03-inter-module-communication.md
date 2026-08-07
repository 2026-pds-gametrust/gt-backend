# Inter-Module Communication — GamerTrust Backend

feature: architecture-canon
doc: ARCH-003
status: Approved
version: 0.1.0
owner: Architecture
jira: N/A
createdAt: 2026-08-07
updatedAt: 2026-08-07
approvedBy: Plan execution gate (Ralph Loops Fase 1)
approvedAt: 2026-08-07

Module boundaries: [01-modular-monolith.md](01-modular-monolith.md). Who talks to whom: [02-module-map.md](02-module-map.md). Transport (SQS/SNS): [05-sqs-messaging.md](05-sqs-messaging.md).

## Communication rules

Modules communicate **only** through client ports (sync, HTTP-shaped) or domain events (async). Direct imports across modules are forbidden (ARCH-001).

| Situation | Mechanism |
|-----------|-----------|
| The caller needs the answer **now** to proceed (validate, render, reserve) | **Sync client port** |
| A module is announcing a **fact** that already happened; consumers react on their own time | **Domain event** |
| A module wants another module to do something as part of its own transaction | **Not allowed** — remodel as event + saga ([04](04-persistence-and-consistency.md)) or move the rule to the owning module |
| A module needs another module's data continuously (search over listings) | **Event-fed read model** (owned by the consumer, DEC-043) |

Prefer events. A sync port is a runtime dependency: if the supplier is down (post-extraction) or slow, the consumer degrades. Every new sync edge must appear in the port catalog in [02](02-module-map.md) and keep the graph acyclic (DEC-022).

## Sync: module client ports

In-process, HTTP-shaped calls (DEC-030). Ownership follows the dependency-inversion pattern the kit already uses for repositories:

1. **Consumer defines the contract** — `src/domain/<consumer>/client/<supplier>.client.interface.ts`, e.g. `orders` defines `IListingsClient` with only the methods and DTO fields it needs. DTO shapes **mirror the supplier's OpenAPI schemas** in `service.yaml` (same field names/types) — this is what makes the port "HTTP-shaped" and keeps extraction honest.
2. **Infra adapter implements it** — `src/infraestructure/client/<supplier>/<supplier>.client.inprocess.ts` imports the **supplier's domain service interface** (the one sanctioned crossing, per ARCH-001) and maps supplier results to the consumer's DTOs. Errors map to the consumer's `EErrorCode` space; supplier domain types never leak through the port.
3. **Factory wires it** — `src/configuration/factory/client/<supplier>.client.factory.ts` builds the adapter with the supplier's service and injects it into the consumer's service factory.
4. **Consumer service depends on the interface only** — like `I*RepositoryRead`, never on the adapter.

```ts
// src/domain/orders/client/listings.client.interface.ts   (consumer-owned)
export interface IListingsClient {
  getListing(listingId: string, actor: ActorContext): Promise<IListingSummary | null>;
  reserve(listingId: string, orderId: string, actor: ActorContext): Promise<EReservationResult>;
  release(listingId: string, orderId: string, actor: ActorContext): Promise<void>;
}
```

### Future extraction path

When a module becomes a service, replace `<supplier>.client.inprocess.ts` with `<supplier>.client.http.ts` (real HTTP call against the same OpenAPI schema) and update the factory. Consumer domain code does not change. This is why DTOs mirror OpenAPI and why sync edges must stay acyclic.

## Async: domain events

- **Naming**: `<module>.<aggregate>.<past-tense-verb>` — `listings.listing.published`, `payments.escrow.released` (DEC-031). Events state **facts**; never imperatives (`search.index.update` is wrong — that's a command).
- **Payload**: facts only — ids, state, timestamps, the changed fields consumers need. No supplier domain classes, no PII (DEC-072, [07](07-security.md)). Consumers needing more call a sync port.
- **Contracts**: the producer contract lives in the producer module's domain (`src/domain/<module>/messaging/<event>/producer.interface.ts`); payload types are exported from there and may be imported by consumer modules' infra handlers (contract sharing, not behavior coupling).

## Event envelope

Every published message wraps its payload in the standard envelope, typed once in `src/domain/common/messaging/event-envelope.ts` (DEC-012):

| Field | Type | Notes |
|-------|------|-------|
| `eventId` | uuid | Unique per message; dedupe key |
| `eventType` | string | Canonical name (`listings.listing.published`) |
| `schemaVersion` | int | Starts at 1; see versioning below |
| `occurredAt` | ISO-8601 | Time of the domain fact, not of publishing |
| `aggregateId` | string | Id of the aggregate the fact is about; FIFO group key ([05](05-sqs-messaging.md)) |
| `producerModule` | string | Module slug |
| `correlationId` | uuid | Propagated from the originating request/saga for tracing |
| `payload` | object | Event-specific facts |

**Versioning** (DEC-031): additive changes (new optional fields) keep the version. Breaking changes bump `schemaVersion`; during migration the producer dual-publishes both versions until all consumers confirm the new one, then the old version is retired.

## Idempotency and delivery semantics

Transport is **at-least-once** ([05](05-sqs-messaging.md)); duplicates and reordering (standard queues) are normal. Consumers are idempotent **by contract** (DEC-032):

| Consumer pattern | When to use |
|------------------|-------------|
| **Naturally idempotent upsert** — read model writes keyed by `aggregateId`, apply-if-newer via `occurredAt`/version | Read-model feeds (search, trust recompute triggers) — the default |
| **Dedupe store** — per-module `processed_events` collection (`eventId` unique index, TTL ≥ 14 days); insert-then-process, skip on duplicate key | Handlers with side effects that must not repeat (payout, notification send, saga steps) |

The dedupe store belongs to the consuming module (one per module, not global). QA test plans must include a duplicate-delivery scenario for every consumer with side effects.

## Publish reliability (outbox policy)

The write to Mongo and the publish to SNS are two systems — a crash between them loses events (dual-write problem). Policy (DEC-033):

- **Phase 1**: services publish **after successful persistence** (kit §10 order preserved), and the risk of a lost event is accepted because every Phase-1 consumer is a rebuildable read model (DEC-043). A scheduled **reconciliation job** (follow-up in [00](00-overview.md)) diffs `listings`/`trust` state against `search_documents` and repairs drift.
- **Phase 2 gate (hard)**: before any `orders.*`, `payments.*`, or `disputes.*` event ships, the **transactional outbox** must be implemented: the event row is written to an `outbox` collection in the same Mongo transaction as the state change; a poller publishes and marks rows. Escrow/order sagas cannot tolerate lost events.

## Actor context propagation

- **Sync ports** receive an explicit `ActorContext` parameter (authenticated user id, groups) — no ambient authority; the supplier applies its own ownership rules ([07](07-security.md)).
- **Events** carry `correlationId` for tracing but no actor PII (DEC-072). Consumers act under a **system** actor; if an event handler needs user data, it calls a sync port with a system actor context.

## Decisions

| ID | Decision | Chosen | Rejected alternatives | Status |
|----|----------|--------|-----------------------|--------|
| DEC-030 | Sync mechanism | In-process client ports: consumer-owned interface + infra adapter + factory wiring; DTOs mirror OpenAPI | HTTP loopback inside the monolith (network failure modes, latency, serialization for nothing); direct service imports (coupling, no extraction path) | Draft |
| DEC-031 | Event naming & versioning | `<module>.<aggregate>.<past-tense-verb>`; `schemaVersion` in envelope; dual-publish on breaking change | Topic-per-consumer naming (couples producer to consumers); no versioning (breaks consumers silently) | Draft |
| DEC-032 | Delivery handling | Consumers idempotent by contract; per-module dedupe store or idempotent upserts | Exactly-once assumptions (not honest over SQS); global dedupe collection (shared-state coupling) | Draft |
| DEC-033 | Publish reliability | Phase 1: publish-after-commit + reconciliation job; Phase 2: mandatory transactional outbox for money-path events | Outbox from day 1 (infrastructure cost before any money flows); accepting dual-write risk forever (unacceptable for escrow) | Draft |

## Approval

- Gate: APPROVED
- Approver: Plan execution gate (Ralph Loops Fase 1)
- Date: 2026-08-07

## Changelog

| Version | Date | Change |
|---------|------|--------|
| 0.1.0 | 2026-08-07 | Initial communication standard |
