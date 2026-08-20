# Persistence and Data Consistency — GamerTrust Backend

feature: architecture-canon
doc: ARCH-004
status: Approved
version: 0.1.0
owner: Architecture
jira: N/A
createdAt: 2026-08-07
updatedAt: 2026-08-07
approvedBy: Plan execution gate (Ralph Loops Fase 1)
approvedAt: 2026-08-07

Extends the kit persistence rules ([docs/architecture-and-layers.md §5](../architecture-and-layers.md)): `IM*` interfaces, schemas/models/adapters in `src/infraestructure/db/mongo/`, pure `dbToInternal`/`internalToDb`, repositories return `null`, `try/catch → DATABASE_ERROR`. Ownership: [02-module-map.md](02-module-map.md). Events/sagas vocabulary: [03](03-inter-module-communication.md) / [05](05-sqs-messaging.md).

## Mongoose conventions (GamerTrust additions)

- Collections: `snake_case` plural (`listings`, `trust_events`); one owning module per collection ([02 §Data ownership](02-module-map.md)).
- All schemas enable `timestamps: true` (`createdAt`/`updatedAt`).
- **Soft delete** only where the product requires history (listings, orders, disputes): `status`-based lifecycle, never a bare `deleted` flag; hard delete only for LGPD erasure ([07](07-security.md)).
- Indexes are declared **in the schema file**, next to the fields they serve, with a comment naming the query they support. No index created manually in Atlas without a matching schema declaration (search/vector indexes are the exception — versioned JSON per [06](06-rag-and-vector-search.md)).
- Monetary values: integer cents (`priceCents`), never floats; currency explicit (`BRL`) in `Money` shared type.
- Aggregates with lifecycles persist a state field typed by an `E*` enum, and transitions are validated in the Service against the state machine defined in its spec.

## Transactions

- Mongo multi-document transactions are allowed **only within one module's collections** (DEC-040). A transaction spanning two modules' collections is a boundary violation — remodel as a saga.
- Requires replica set: local dev runs `mongod` as a single-node replica set (docker-compose); integration tests use `mongodb-memory-server` in replset mode.
- Default tool order: (1) single-document conditional update, (2) intra-module transaction, (3) saga. Reach for the next one only when the previous can't express the invariant.

## Single-document atomicity patterns

Conditional `findOneAndUpdate` with a state precondition is the default concurrency control — no locks, no transactions:

```ts
// Unique-unit reservation (listings module) — DEC-041
const reserved = await ListingModel.findOneAndUpdate(
  { _id: listingId, status: EListingStatus.PUBLISHED },   // precondition
  { $set: { status: EListingStatus.RESERVED, reservedBy: orderId, reservedAt: now } },
  { new: true },
);
return reserved ? dbToInternal(reserved) : null;          // null → service decides the business error
```

Two concurrent buyers: exactly one matches the precondition; the other gets `null` and the Service raises the product error (409 `LISTING_ALREADY_RESERVED`). The same pattern guards every state transition (publish, pause, escrow release).

## Cross-module consistency

No two-phase commit, no cross-module transactions. Cross-module invariants are **sagas**: a sequence of local steps coordinated by events, each with a compensation.

- Every saga is specified in its feature spec as a state machine on the owning aggregate (e.g. `Order`): states, allowed transitions, triggering events, compensations, timeouts.
- Saga steps that consume events use the dedupe store ([03 §Idempotency](03-inter-module-communication.md)); money-path sagas ride FIFO queues ([05 §Standard vs FIFO](05-sqs-messaging.md)) and require the outbox (DEC-033).
- Compensations are business actions (refund, release reservation), not DB rollbacks — they must be idempotent too.

## Read models and denormalization

A module may keep an event-fed denormalized copy of other modules' data (DEC-043). Rules:

1. The copy is **disposable**: rebuildable from the owners at any time; a documented rebuild procedure is mandatory.
2. The copy is **never written back** to the owner and never becomes anyone's source of truth.
3. Each read model declares a **staleness budget**; exceeding it is an incident, handled by reconciliation, not by turning the read model into a sync call.

| Read model | Owner | Fed by | Staleness budget | Rebuild |
|------------|-------|--------|------------------|---------|
| `search_documents` | search | `listings.*`, `catalog.product.*`, `trust.score.updated` | 60 s (listing state), 15 min (trust score) | Full scan of listings + catalog + trust via ports; nightly reconciliation diff (DEC-033) |
| `rag_documents` (P3) | ai | `catalog.*`, `listings.*`, `verification.case.*`, `reviews.*` | 24 h | Batch re-ingestion pipeline ([06](06-rag-and-vector-search.md)) |
| Seal cache in listings render (optional) | listings | `verification.seal.*` | 60 s | Re-fetch via `IVerificationClient.getSeals` |

## Consistency-critical flows

| Flow | Owner (aggregate) | Mechanism |
|------|-------------------|-----------|
| **Unique-unit reservation** (no double-sell) | listings (`Listing`) | Sync port `IListingsClient.reserve` → conditional update (pattern above). Reservation has a TTL; expiry job releases and emits `listings.listing.updated` (DEC-041) |
| **Escrow ↔ order state** | orders (`Order`) + payments (`EscrowHold`) | Saga over FIFO events (`orders.order.*` ↔ `payments.escrow.*`); outbox mandatory (DEC-033); each step a conditional state transition; compensations: refund / release reservation |
| **TrustScore** | trust (`TrustScore`) | Append-only `trust_events` ledger (DEC-042): consumed events append facts; score = deterministic recompute over the ledger. Eventual, but **reproducible and explainable** ("12 completed sales, 98% without issues") as the product requires |
| **Seals vs listing edits** | verification (`Seal`) | `listings.listing.updated` → verification evaluates relevance → suspends seals (`verification.seal.suspended`) pending re-verification. Render paths read seal state from verification (port or event-fed cache); a suspended seal must never display as active |
| **Listing state ↔ search index** | search (`SearchDocument`) | Event-fed upserts (apply-if-newer on `occurredAt`); sold/paused/expired listings removed from results; nightly reconciliation repairs drift |
| **Reviews only from completed orders** | reviews (`Review`) | On create, reviews checks `IOrdersClient.isCompletedPurchase(orderId, buyerId)` synchronously; uniqueness (one review per order per side) via unique index |
| **Dispute → refund → reputation** | disputes (`Dispute`) | `disputes.dispute.resolved` consumed by payments (refund/release — FIFO), orders (close state), trust (ledger append). Each consumer idempotent; saga documented in the disputes spec |

## Migrations and backfills

- Schema changes answer the design-template questions explicitly: new field required or optional? old records stay valid? default value?
- Additive-first: new fields optional with a default read path; backfill scripts live in `scripts/migrations/` (follow-up), are idempotent, and are referenced by the feature spec that introduced them.
- Never mutate owned data of another module in a migration — hand-offs (e.g. `price_history`, DEC-023) get their own migration spec with event replay.

## Decisions

| ID | Decision | Chosen | Rejected alternatives | Status |
|----|----------|--------|-----------------------|--------|
| DEC-040 | Transaction scope | Multi-doc transactions only within one module; cross-module = saga with compensations | Cross-module transactions (couples schemas, blocks extraction); 2PC (not supported, complexity) | Draft |
| DEC-041 | Reservation concurrency | Sync port + single-document conditional update with state precondition + TTL expiry | Distributed lock (extra infra, failure modes); event-based reservation (window for double-sell) | Draft |
| DEC-042 | TrustScore storage | Append-only `trust_events` ledger + deterministic recompute | Mutable score updated in place (not reproducible/explainable); recompute from other modules' collections (boundary violation) | Draft |
| DEC-043 | Read-model doctrine | Disposable, rebuildable, never written back; declared staleness budget + rebuild procedure | Treating read models as sources of truth; sync fan-out reads on the hot path (latency, coupling) | Draft |

## Approval

- Gate: APPROVED
- Approver: Plan execution gate (Ralph Loops Fase 1)
- Date: 2026-08-07

## Changelog

| Version | Date | Change |
|---------|------|--------|
| 0.1.0 | 2026-08-07 | Initial persistence & consistency standard |
