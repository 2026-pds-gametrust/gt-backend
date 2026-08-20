# RAG and Vector Search — GamerTrust Backend

feature: architecture-canon
doc: ARCH-006
status: Approved
version: 0.1.0
owner: Architecture
jira: N/A
createdAt: 2026-08-07
updatedAt: 2026-08-07
approvedBy: Plan execution gate (Ralph Loops Fase 1)
approvedAt: 2026-08-07

MongoDB Atlas Search (lexical) and Atlas Vector Search (semantic/RAG) standard. Product sources: `context/GamerTrust-03-SEARCH-AND-DISCOVERY.md` and `context/GamerTrust-06-AI-PRODUCT-STRATEGY.md`. Read-model doctrine: [04 §Read models](04-persistence-and-consistency.md) (DEC-043).

## Scope and phase gating

| Capability | Phase | Mechanism |
|------------|-------|-----------|
| Lexical search, autocomplete, typo tolerance, synonyms ("pleisteiton 5" → PlayStation 5) | 1 | Atlas Search text index on `search_documents` + operational `synonyms` collection (projection of catalog category/service aliases — DEC-024) |
| Natural-language intent search ("placa para jogar em 1440p até 2500") | 3 | Hybrid: vector search + structured filter extraction (user-editable interpretation) |
| Image search / product identification | 3 | Image embeddings → vector search over catalog |
| Trust summary, buyer assistant, comparator summaries (RAG) | 3 | Retrieval over `rag_documents` + generation with guardrails |
| Offer↔product matching, duplicate media detection | 3 | Embedding similarity + media fingerprinting (ai module) |

Phase 1 ships **no vectors** — but `search_documents` is designed from day 1 to carry an optional `embedding` field so Phase 3 adds an index, not a migration.

## Collections and ownership

| Collection | Owner | Content | Vector field |
|------------|-------|---------|--------------|
| `search_documents` | search | Denormalized listing + product + trust facts for query/rank | `embedding` (P3): listing/product text embedding |
| `synonyms` | search | Operational synonym map projected from catalog `categories`/`services` (DEC-024). Rebuildable; never the edit surface for taxonomy aliases | — |
| `rag_documents` | ai | Chunked corpus: product specs, published evidence summaries, policies, FAQs | `embedding`: chunk embedding |

**Synonym ownership (DEC-024):** catalog stores canonical `synonyms[]` on `categories` and `services`. Search consumes `catalog.category.*` / `catalog.service.*` and upserts into `synonyms`. Admins must not mutate taxonomy aliases through search APIs.

`search_documents`, `synonyms`, and `rag_documents` are event-fed read models (DEC-043, DEC-060): rebuildable, never written back to owners, fed by the event subscriptions in [02-module-map.md](02-module-map.md). Vectors **never** live on owner modules' write collections — index lifecycle and re-embedding stay decoupled from transactional writes.

## Embedding pipeline

1. **Trigger**: consume `listings.listing.published/updated`, `catalog.product.updated` (and corpus events for `rag_documents`).
2. **Job**: the consuming module enqueues an embedding job (`embedding_jobs`, owner ai) — embedding is async and must never block the event handler or a user request.
3. **Provider**: behind `IEmbeddingService` in the owning module's domain (`src/domain/ai/service/` or `search`), implementation in `src/infraestructure/` (DEC-061). Provider/model choice is configuration, not code.
4. **Stamping**: every embedded document stores `embeddingModel` + `embeddingVersion`; re-embedding after a model change is a batch backfill filtered by version — old and new vectors never mix in one index query.
5. **Backfill**: batch command for initial load and re-embedding (follow-up script; referenced by the Phase 3 feature spec).

## Index conventions

- Atlas Search and Vector Search index definitions are **versioned JSON files in the repo**: `src/infraestructure/db/mongo/search-indexes/<collection>.<index-name>.json`, applied by script/CI — no click-ops (DEC-063).
- Vector index definitions record `numDimensions`, `similarity` (default `cosine`), and the filter fields used for pre-filtering (`status`, `categoryId`, `priceCents` range).
- Index names: `<collection>_<purpose>` (`search_documents_lexical`, `search_documents_vector`).

## Query patterns

All behind domain repository contracts of the `search`/`ai` modules (e.g. `ISearchRepository`) — `$search`/`$vectorSearch` aggregation stages are infra details:

- **Lexical (P1)**: `$search` with compound queries (text + filters), synonym mapping, fuzzy for typo tolerance.
- **Vector (P3)**: `$vectorSearch` with pre-filters (only `PUBLISHED` listings — consistency rule from [04](04-persistence-and-consistency.md)).
- **Hybrid (P3)**: lexical + vector merged with reciprocal rank fusion (RRF) in the service layer; ranking signals (trust score, listing quality) applied as documented, explainable boosts — sponsored results always labeled, never disguised as organic (product rule).

## RAG guardrails

From `GamerTrust-06` (normative for every AI feature):

1. **Retrieval-only answers** — generated content states only facts present in retrieved documents; no invented attributes, prices, or seller claims.
2. **Citations** — trust summaries and assistant answers reference their source documents (evidence summary, seal, review) so the UI can show provenance.
3. **Declared uncertainty** — below retrieval confidence thresholds, say "not enough information", never guess.
4. **Human review for consequential outputs** — anything that blocks/rejects a listing, accuses fraud, or affects money is a *suggestion* to a human queue (moderation module), never auto-applied.
5. **Privacy** — raw evidence media never enters `rag_documents`; only the published-safe summaries ([07](07-security.md), DEC-071). No personalization on sensitive data.
6. **Measurement** — hallucination rate and AI-triage vs human-decision divergence are tracked metrics (analytics module) per `GamerTrust-08`.

## Local development and CI

- **Local dev**: Atlas CLI local deployment (`atlas deployments setup --type local`, Docker-based) — supports Atlas Search and Vector Search locally (DEC-062; follow-up script in [00](00-overview.md)).
- **Jest**: the default suite (`yarn test`) never requires Atlas Search — search behavior is tested behind the domain contracts with stubbed repositories. A small tagged suite (`*.atlas.test.ts`, excluded from the default run) exercises real index queries against the local Atlas deployment.

## Decisions

| ID | Decision | Chosen | Rejected alternatives | Status |
|----|----------|--------|-----------------------|--------|
| DEC-060 | Vector placement | Vectors on read-model collections owned by search/ai | Vectors on `listings`/`products` write collections (couples re-embedding to transactional writes; index churn on the source of truth) | Draft |
| DEC-061 | Embedding provider | Abstracted behind a domain interface; model + version stamped per document | Direct SDK calls in services (lock-in, untestable); unversioned embeddings (silent mixed-model indexes) | Draft |
| DEC-062 | Local/CI strategy | Atlas CLI local deployment for dev; hermetic Jest via domain-contract stubs + tagged opt-in real-index suite | Requiring Atlas cloud for dev/CI (cost, flakiness); skipping real-index testing entirely (index definitions unverified) | Draft |
| DEC-063 | Index management | Index definitions versioned in repo, applied by script | Manual Atlas UI management (drift, unreviewable) | Draft |

## Approval

- Gate: APPROVED
- Approver: Plan execution gate (Ralph Loops Fase 1)
- Date: 2026-08-07

## Changelog

| Version | Date | Change |
|---------|------|--------|
| 0.1.1 | 2026-08-07 | Loop 01a: `synonyms` as catalog projection (DEC-024) |
| 0.1.0 | 2026-08-07 | Initial RAG / vector search standard |
