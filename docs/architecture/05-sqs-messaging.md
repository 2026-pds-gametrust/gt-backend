# SQS Messaging Standard — GamerTrust Backend

feature: architecture-canon
doc: ARCH-005
status: Approved
version: 0.1.0
owner: Architecture
jira: N/A
createdAt: 2026-08-07
updatedAt: 2026-08-07
approvedBy: Plan execution gate (Ralph Loops Fase 1)
approvedAt: 2026-08-07

Transport standard for the domain events defined in [03-inter-module-communication.md](03-inter-module-communication.md) (naming, envelope, idempotency) and cataloged in [02-module-map.md](02-module-map.md). Replaces the kit's former Kafka assumption ([docs/architecture-and-layers.md §10](../architecture-and-layers.md)).

## Layer placement

Mirrors the kit messaging pattern; the domain never names the transport (DEC-052):

1. **Contract in domain** — `src/domain/<context>/messaging/<event>/producer.interface.ts` (transport-neutral name; exports the payload type).
2. **Implementation in infra** — `src/infraestructure/messaging/<event>/producer.sqs.ts` and, for consumers, `consumer.sqs.ts` (transport suffix lives only here).
3. **Factory registration** — `src/configuration/factory/messaging/`.
4. **Service calls the interface** after successful persistence (order per [03 §Publish reliability](03-inter-module-communication.md)).
5. **Idempotency** per [03 §Idempotency](03-inter-module-communication.md).

Shared publisher contract: `IEventPublisher` in `src/domain/common/messaging/` (publishes an enveloped event; per-event producer interfaces compose it). AWS SDK packages (`@aws-sdk/client-sns`, `@aws-sdk/client-sqs`) are **infra-only** dependencies — never imported in domain, application, or configuration factories beyond injection wiring.

## Topology

**SNS topic per event type, SQS queue per (consumer module × event)** — SNS fan-out (DEC-050):

```text
listings.listing.published ──▶ SNS topic gt-<env>-listings-listing-published
                                 ├─▶ SQS gt-<env>-search-listings-listing-published
                                 ├─▶ SQS gt-<env>-favorites-listings-listing-published   (P2)
                                 └─▶ SQS gt-<env>-ai-listings-listing-published          (P3)
```

Naming:

| Resource | Pattern | Example |
|----------|---------|---------|
| SNS topic | `gt-<env>-<event-type-dashed>` | `gt-prod-listings-listing-published` |
| SQS queue | `gt-<env>-<consumer-module>-<event-type-dashed>` | `gt-prod-search-listings-listing-published` |
| DLQ | queue name + `-dlq` | `gt-prod-search-listings-listing-published-dlq` |

Rationale: most events have multiple consumers (search + trust + favorites); per-consumer queues give each module independent retry/DLQ/backpressure and mirror the future service-extraction boundary. New subscriptions never touch the producer.

## Standard vs FIFO

- **Standard queues by default** — consumers are idempotent and order-tolerant (DEC-032), so we don't pay FIFO throughput limits where ordering is not required.
- **FIFO** (topic + queues `.fifo`, `MessageGroupId = aggregateId`, `MessageDeduplicationId = eventId`) **only** for `orders.*` and `payments.*` (DEC-051): order/escrow state machines require per-aggregate ordering ([04 §flows](04-persistence-and-consistency.md)).

## Retry and DLQ

- Every queue has a redrive policy to its `-dlq`; default `maxReceiveCount: 5`.
- Visibility timeout ≥ 6× the handler's p99 processing time (default 60s; long handlers must heartbeat or split).
- DLQ depth > 0 raises an alarm to the on-call channel; messages are **replayed** (after fix) via a replay script that re-sends to the source queue — never edited by hand, never deleted silently.
- Poison messages (fail on replay too) are archived to S3 with the failure reason before removal.

## Consumer runtime

- Long-polling workers (`WaitTimeSeconds: 20`) started from the app bootstrap in `src/app.ts` **after** the database connection, built by `src/configuration/factory/messaging/`.
- The infra consumer (`consumer.sqs.ts`) only: receives, parses/validates the envelope, and delegates to a **domain service method** of the consuming module (e.g. `SearchIndexService.applyListingPublished(event)`); business decisions never live in the consumer file.
- Delete the message only after the handler resolves; on error, let visibility timeout expire (retry → DLQ).
- Graceful shutdown: stop polling, finish in-flight handlers, then close DB.

## Publishing

- Services publish through the injected per-event producer interface after successful persistence.
- The producer implementation envelopes the payload ([03 §Envelope](03-inter-module-communication.md)) and publishes to the event's SNS topic.
- Message attributes duplicate `eventType` and `schemaVersion` for filtering without body parsing.

## Local development and tests

- **Local dev**: LocalStack (SNS + SQS) via docker-compose (follow-up item in [00](00-overview.md)); a bootstrap script creates topics/queues/subscriptions from the catalog in [02](02-module-map.md).
- **Jest**: the suite **never talks to a broker** (DEC-053, kit test doctrine). Service tests `jest.spyOn` the injected producer interface and assert the published payload; consumer logic is tested by calling the domain handler method directly with a built envelope. Integration with real LocalStack is an optional smoke script outside `yarn test`.

## Decisions

| ID | Decision | Chosen | Rejected alternatives | Status |
|----|----------|--------|-----------------------|--------|
| DEC-050 | Topology | SNS topic per event type → SQS queue per consumer module | Single shared queue per consumer for all events (head-of-line blocking, no per-event redrive); direct SQS without SNS (producer must know consumers — coupling) | Draft |
| DEC-051 | Ordering | Standard by default; FIFO with `MessageGroupId = aggregateId` only for `orders.*` / `payments.*` | FIFO everywhere (throughput limits, cost, no benefit for idempotent read models) | Draft |
| DEC-052 | Naming in domain | `producer.interface.ts` transport-neutral; `.sqs.` suffix only in infra filenames | `producer.interface.sqs.ts` in domain (transport leak — exactly what kit rule 1 forbids) | Draft |
| DEC-053 | Dev & test strategy | LocalStack for local dev; Jest spies on interfaces, no broker in the suite | Broker-in-tests (slow, flaky, breaks kit doctrine); mocking the AWS SDK (tests the SDK, not our contract) | Draft |

## Approval

- Gate: APPROVED
- Approver: Plan execution gate (Ralph Loops Fase 1)
- Date: 2026-08-07

## Changelog

| Version | Date | Change |
|---------|------|--------|
| 0.1.0 | 2026-08-07 | Initial SQS/SNS standard (replaces Kafka assumption) |
