# Ledger — Loop E16: Entity search-document

## Status
COMPLETED

## Objetivo
Implementar a entidade `search-document` conforme docs/entities/search-document e specs `search-document-mvp`.

## Escopo executado
- Specs `docs/specs/search-document-mvp/` APPROVED
- Collection `search_documents`
- Upsert/reindex on publish; delete on pause
- GET `/search` com filtros Mongo simples

## Agentes envolvidos
| Agente | Responsabilidade | Resultado |
|---|---|---|
| agt-dev-backend | Implementar E16 | COMPLETED |

## Validações realizadas
- `yarn test:int`

## Pendências e bloqueios
- OpenSearch/Atlas Search deferred (P3)

## Resultado final
Entidade `search-document` entregue end-to-end.
