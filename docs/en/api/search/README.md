# Domain: search

## Product value

Search is the home entry point. Synonyms and reconcile keep relevance.

## Endpoints (3)

| Method | Path | Summary | Contract |
|--------|------|--------|----------|
| `GET` | `/search` | Lexical search over published listing documents | [open](./search/get-search/) |
| `POST` | `/search/reconcile` | Rebuild search_documents for PUBLISHED listings and synonym projections from taxonomy | [open](./search/post-search-reconcile/) |
| `GET` | `/synonyms` | List synonym projections for expansion | [open](./synonyms/get-synonyms/) |

## Resources

- [`search/`](./search/)
- [`synonyms/`](./synonyms/)
