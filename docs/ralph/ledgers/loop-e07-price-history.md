# Ledger — Loop E07: Entity price-history

## Status
COMPLETED

## Objetivo
Implementar a entidade `price-history` conforme docs/entities/price-history e specs `price-history-mvp`.

## Escopo executado
- Specs `docs/specs/price-history-mvp/` (requirements, design, test-plan) APPROVED
- Domain/infra/application/factories + OpenAPI
- Collection `price_history`
- Testes de integração (service + controller where applicable)

## Agentes envolvidos
| Agente | Responsabilidade | Resultado |
|---|---|---|
| agt-dev-backend | Implementar E07 | COMPLETED |

## Validações realizadas
- `yarn test:int` (suite E05–E09 incluída)

## Pendências e bloqueios
- Verification gate for publish deferred to verification module loop
- Sync ports ICatalogClient / IListingsClient thin reuse of repositories in Phase 1

## Resultado final
Entidade `price-history` entregue end-to-end.
