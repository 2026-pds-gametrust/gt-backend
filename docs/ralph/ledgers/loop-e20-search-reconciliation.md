# Ledger — Loop E20: Search reconciliation

## Status
COMPLETED

## Objetivo
Implementar reconciliação dos read models de search (equivalente entity-first do antigo L56): rebuild de `search_documents` para listings PUBLISHED e projeção de `synonyms` a partir de categories + services.

## Escopo executado
- Specs `docs/specs/search-reconciliation-mvp/` APPROVED
- `SearchReconciliationService` reusando `reindexListing` + `upsertFromTaxonomy`
- `POST /search/reconcile` backoffice-only → `{ listingsReindexed, synonymsUpserted }`
- OpenAPI `SearchReconcileResult`
- Int test happy path (`search-reconcile.int.test.ts`)

## Criações
- `src/domain/search/service/search-reconciliation.service.ts` (+ interface)
- `src/configuration/factory/search-reconciliation.service.factory.ts`
- `src/__tests__/integration/search/controller/search-reconcile.int.test.ts`
- `docs/specs/search-reconciliation-mvp/*`

## Agentes envolvidos
| Agente | Responsabilidade | Resultado |
|---|---|---|
| agt-dev-backend | Implementar E20 | COMPLETED |

## Validações realizadas
- `yarn test:int` (suite Phase 1 / targeted reconcile)
- `yarn lint`

## Pendências e bloqueios
- Cron/scheduler da reconciliação noturna permanece deferred (DEC-033 follow-up)
- Async SQS consumers / OpenSearch deferred (Phase 2+)

## Resultado final
Reconciliação de search entregue end-to-end via endpoint backoffice.
