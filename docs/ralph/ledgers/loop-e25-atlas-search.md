# Ledger — Loop E25: Atlas Search lexical (`ISearchEngine`)

## Status
COMPLETED

## Objetivo
Lexical search via port `ISearchEngine`: Atlas Search em produção e fallback Mongo (regex) para testes/local, com expansão de sinônimos.

## Escopo executado
- Specs Approved: `docs/specs/atlas-search-mvp/{requirements,design,test-plan}.md`
- Domain port `ISearchEngine` / `ISearchEngineQuery`
- `MongoTextSearchEngine` + `AtlasSearchEngine` (`$search` index `search_documents_lexical`)
- `SearchEngineFactory` (`SEARCH_ENGINE=mongo|atlas`, default mongo em test)
- `SearchDocumentService.search` expande sinônimos e delega ao engine; QueryLog + zero-result mantidos
- Index JSON versionado + design
- Unit test de expansão de sinônimos; int tests com mongo

## Alterações
- `src/domain/search/service/search-document.service*.ts` — inject `searchEngine` + `synonymService`
- `src/infraestructure/repository/search/search-document.repository.read.ts` — multi-term OR + `limit`
- `src/configuration/factory/search-document.service.factory.ts` — wiring

## Criações
- `src/domain/search/engine/search-engine.interface.ts`
- `src/infraestructure/search/mongo-text-search.engine.ts`
- `src/infraestructure/search/atlas-search.engine.ts`
- `src/configuration/factory/search-engine.factory.ts`
- `src/infraestructure/db/mongo/search-indexes/search_documents.search_documents_lexical.json`
- `docs/specs/atlas-search-mvp/*`
- `docs/ralph/ledgers/loop-e25-atlas-search.md`
- `src/__tests__/unit/search/service/search-document-synonym-expansion.unit.test.ts`

## Agentes envolvidos
| Agente | Responsabilidade | Resultado |
|---|---|---|
| agt-dev-backend | Implementação E25 | COMPLETED |

## Validações realizadas
- `yarn test:unit -- search-document-synonym-expansion` — **PASS** (1 test)
- `yarn test:int` — **PASS** — 96 suites, **241** tests

## Pendências e bloqueios
- none

## Impactos nos próximos loops
- Produção deve criar o índice Atlas `search_documents_lexical` e setar `SEARCH_ENGINE=atlas`
- Suite `*.atlas.test.ts` (opt-in) ainda não existe

## Resultado final
Loop E25 COMPLETED — lexical search behind ISearchEngine (Atlas/Mongo).
