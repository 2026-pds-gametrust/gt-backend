# Ledger — Loop E22: Domain SQS consumers

## Status
COMPLETED

## Objetivo
Wire domain SQS/event consumers, desacoplar sync search/synonym dos producers, manter testes verdes via in-process dispatch dos mesmos handlers quando pollers SQS estão off.

## Escopo executado
- Specs Approved: `docs/specs/domain-sqs-consumers-mvp/{requirements,design,test-plan}.md`
- `DispatchingEventPublisher` + `DomainEventRouter` + handlers (search, taxonomy synonyms, verification submit, listings approved stub)
- `EventPublisherFactory` retorna DispatchingEventPublisher; router lazy (evita ciclo de factories)
- `EVENT_INPROCESS_DISPATCH` default true quando `SQS_CONSUMERS_ENABLED` ≠ true
- `MessagingConsumersFactory.start()` após DB em `app.ts` quando consumers enabled
- Listing/Category/ServiceTaxonomy sem dependência direta de SearchDocument/Synonym
- Emit `listings.listing.submitted|published|paused` além de `status_changed`
- LocalStack: `scripts/localstack/bootstrap-messaging.sh`
- Testes unit/int de handlers e efeitos via in-process dispatch

## Alterações
- Producers listing/catalog: eventos apenas; side effects via handlers
- VerificationCaseService: `ensureOpenCaseForListing` idempotente
- ListingService: `applyVerificationApproved` stub (E23)
- Factories listing/category/service-taxonomy sem Search/Synonym inject

## Criações
- Domain: dispatching publisher, router, handlers sob `messaging/handlers/`
- Config: `messaging.env.ts`, `domain-event-router.factory.ts`, `messaging-consumers.factory.ts`
- `scripts/localstack/bootstrap-messaging.sh` — SNS topics + SQS (+ DLQ) + subscriptions para eventos-chave
- Tests: `domain-event-router.unit.test.ts`, `domain-event-consumers.int.test.ts`

## LocalStack bootstrap

```bash
docker compose up -d localstack
./scripts/localstack/bootstrap-messaging.sh
# export SQS_CONSUMERS_ENABLED=true
# export SQS_CONSUMER_QUEUE_URLS=<urls from script>
# EVENT_INPROCESS_DISPATCH defaults to false when consumers enabled
```

## Agentes envolvidos
| Agente | Responsabilidade | Resultado |
|---|---|---|
| agt-dev-backend | Implementação E22 | COMPLETED |

## Validações realizadas
- `yarn test:unit` — **PASS** — 6 suites, **11** tests
- `yarn test:int` — **PASS** — 41 suites, **104** tests
- Targeted: `domain-event-router.unit` (4) + `domain-event-consumers.int` (3)

## Pendências e bloqueios
- E23: implementar `applyVerificationApproved` (auto-publish)
- Publisher SNS ainda usa topic/queue único via env (não topic-per-event em runtime); bootstrap cria topologia completa para LocalStack
- Lint repo-wide `no-explicit-any` pré-existente

## Impactos nos próximos loops
- E23 pode preencher o stub de verification approved
- Consumers reais com LocalStack smoke opcional fora do Jest

## Resultado final
Loop E22 COMPLETED — consumers de domínio wired; producers desacoplados; in-process dispatch mantém Jest sem broker.
