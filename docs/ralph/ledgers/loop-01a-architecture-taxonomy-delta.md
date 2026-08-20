# Ledger — Loop 01a: Architecture taxonomy delta

## Status
COMPLETED

## Objetivo
Registrar no canon a base única de `categories` e `services` com sinônimos e unicidade (DEC-024).

## Escopo executado
- Ownership `services` em catalog; eventos e ports de category/service.
- `search.synonyms` documentado como projeção (não master data).
- Glossário EN↔PT: Category, Service (taxonomy), Synonym.
- DEC-024 no registry ARCH-000 e Decisions ARCH-002.

## Alterações
- `docs/architecture/00-overview.md` — DEC-024 no registry; changelog 0.1.1; pendência 01a removida.
- `docs/architecture/02-module-map.md` — collections, events, ports, seção Taxonomy master data, DEC-024.
- `docs/architecture/06-rag-and-vector-search.md` — synonyms projection + ownership.
- `docs/architecture/08-glossary.md` — termos Category / Service / Synonym.

## Criações
- Este ledger.

## Agentes envolvidos
| Agente | Responsabilidade | Resultado |
|---|---|---|
| agt-orchestrator (sessão) | Aplicar delta e consolidar | DEC-024 APPROVED no canon |

## Validações realizadas
- Tabela de ownership lista `services`.
- Unicidade global de sinônimo documentada.
- Search não é superfície de edição de aliases.

## Pendências e bloqueios
- Implementação em `src/` fica para Wave 3a (L14–L19).
- Seed de dados reais não faz parte deste loop.

## Impactos nos próximos loops
- Wave 1 (L03+) pode iniciar.
- Specs `catalog-taxonomy-mvp` devem citar DEC-024 / ARCH-002.

## Resultado final
Canon atualizado e aprovado para taxonomia categories + services com synonyms.
