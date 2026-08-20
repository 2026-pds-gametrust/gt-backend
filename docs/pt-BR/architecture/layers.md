# Camadas

Onde vivem código e regras. Contrato do kit: [docs/architecture-and-layers.md](../../architecture-and-layers.md) e [AGENTS.md](../../../AGENTS.md). Inglês: [en](../../en/architecture/layers.md).

## Mapa

```text
HTTP → Controller (application)
     → Service (domain)
     → I*Repository* e/ou IEventPublisher / I*Client
     → Implementação + adapters (infraestructure)
     → Mongo / S3 / SNS+SQS
```

Depois de um write ok, o Service pode `publish` um `IEventEnvelope`. Handlers em **outros módulos** são `IEventHandler` de domínio que chamam o **Service daquele módulo** — AWS nunca no domain. Detalhe: [comunicação](./communication.md), [mensageria](./messaging.md).

Composição (DI) só em `src/configuration/factory/`.

| Camada | Pasta | Dono | Não pode |
|--------|-------|------|----------|
| Domain | `src/domain/` | Entidades, services, contratos `I*`, `IEventPublisher`, producers por evento, `IEventHandler` | Mongoose, `IM*`, Express `req`, `SNSClient` / `SQSClient` |
| Application | `src/application/` | Controllers finos, `authorizeByGroup`, status HTTP, `handleTranslatedError` | 404/409 de produto, `*Model`, ownership como “id na URL”, publicar eventos |
| Infraestructure | `src/infraestructure/` | `IM*`, schemas, repos, adapters, `SqsEventPublisher` / `SqsEventConsumer`, S3 | Unicidade / máquinas de estado; decidir *o que* publicar |
| Configuration | `src/configuration/` | Constantes de env, factories (incluindo `factory/messaging/`) | Regras de negócio, `process.env` espalhado |
| Contracts | `src/contracts/` | OpenAPI `service.yaml` | — |

## Regras de negócio

- **Entity** (`*ServiceEntity`): invariantes locais (campo obrigatório, formato).
- **Service**: unicidade, “não encontrado”, fluxos, ownership, idempotência.
- **Repository**: CRUD/query, `null` se faltar, `DATABASE_ERROR` em falha de driver. Nunca 404/409 de produto.

## Nomes

| Forma | Uso |
|-------|-----|
| `I*` | Interfaces de domínio |
| `IM*` | Forma persistida Mongo (só infra) |
| `E*` | Enums |
| `*ServiceEntity` | Entidade com validação local |

Um caso de uso é um método de `*Service` (ex.: `createListing`), não uma classe `*UseCase`.

## Testes

Espelho em `src/__tests__/`. Meta ≥ 80% (`yarn test:coverage`).
