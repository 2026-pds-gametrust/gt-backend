---
name: skill-sqs-messaging
description: >-
  Checklist to add SQS producer/consumer in this repository: contract in domain,
  implementation in infraestructure, factory injection and service call after persistence.
  Use when the user asks for an SQS event, async message or messaging integration.
disable-model-invocation: true
---

# Skill: SQS (messaging)

Follow **§10 Messaging (optional)** in [docs/architecture-and-layers.md](../../../docs/architecture-and-layers.md) (messaging contracts in domain; concrete producers/consumers in infraestructure). GamerTrust transport standard: [docs/architecture/05-sqs-messaging.md](../../../docs/architecture/05-sqs-messaging.md).

## Steps

1. **Domain** — `src/domain/<context>/messaging/<event>/`
   - Producer interface, e.g. `producer.interface.ts` (`I*` appropriate to the event)

2. **Infraestructure** — `src/infraestructure/messaging/<event>/`
   - `producer.sqs.ts` and/or `consumer.sqs.ts` implementing the contract

3. **Service** — inject producer interface; call **after** successful repository operation (when it makes business sense)

4. **Configuration** — register producer (and consumer/worker if any) in the corresponding factory, e.g. `src/configuration/factory/messaging/`

5. **Tests** — use `jest.spyOn` on the injected producer interface in service tests when applicable (do not mock the Repository). See [`agt-test-author`](../../agents/agt-test-author.md) / [`skill-tests-layered`](../skill-tests-layered/SKILL.md).

## Rules

- Contract **always** in domain; implementation **always** in infraestructure.
- Do not import concrete SQS messaging in the domain.
