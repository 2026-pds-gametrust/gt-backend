---
name: sqs-messaging
description: >-
  Checklist to add an SQS event producer/consumer in this repository: transport-neutral
  contract in domain, SQS implementation in infraestructure, factory wiring, tests with spies.
  Use when the user asks for an SQS event, async message or messaging integration.
---

# Skill: SQS (messaging)

Follow **§10 Messaging (optional)** in [docs/architecture-and-layers.md](../../../docs/architecture-and-layers.md) (messaging contracts in domain; concrete producers/consumers in infraestructure). GamerTrust transport standard (topology, envelope, DLQ, local dev): [docs/architecture/05-sqs-messaging.md](../../../docs/architecture/05-sqs-messaging.md) and [docs/architecture/03-inter-module-communication.md](../../../docs/architecture/03-inter-module-communication.md).

## Steps

1. **Domain** — `src/domain/<context>/messaging/<event>/`
   - Producer interface, e.g. `producer.interface.ts` (`I*` appropriate to the event; transport-neutral — never name SQS in domain)
   - Export the event payload type; the message uses the standard envelope from `src/domain/common/messaging/`
2. **Infraestructure** — `src/infraestructure/messaging/<event>/`
   - `producer.sqs.ts` and/or `consumer.sqs.ts` implementing the contract (SNS publish / SQS long-polling per ARCH-005)
3. **Configuration** — `src/configuration/factory/messaging/`
   - Factory that builds the producer/consumer and injects the **interface** into the service factory
4. **Service** — calls the injected interface **after** successful persistence; never imports the implementation
5. **Idempotency** — consumer handlers are idempotent (dedupe store or idempotent upsert per ARCH-003)
6. **Tests** — `jest.spyOn` the injected producer interface; call consumer domain handlers directly with a built envelope; never connect to a broker in Jest

## Rules

- Event names: `<module>.<aggregate>.<past-tense-verb>` (e.g. `listings.listing.published`).
- Do not import concrete SQS (AWS SDK) in the domain.
- Payloads carry facts and ids — never PII (ARCH-007).
- New events must be registered in the event catalog of [docs/architecture/02-module-map.md](../../../docs/architecture/02-module-map.md).
