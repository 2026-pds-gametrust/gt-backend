# Synonym MVP — Design

feature: synonym-mvp
status: Approved
version: 0.1.0

## Citations

- docs/entities/synonym/*

## Placement

| Concern | Layer |
|---------|-------|
| ISynonym + ESynonymTargetType | domain/search |
| Projection upsert | SynonymService |
| Mongo `synonyms` | infraestructure |
| GET `/synonyms` | SearchController |

## Decisions

| ID | Decision |
|----|----------|
| D1 | Collection `synonyms`; unique normalizedTerm |
| D2 | Sync projection from CategoryService / ServiceTaxonomyService (not async consumer in MVP) |
| D3 | ownerType maps to ESynonymTargetType CATEGORY \| SERVICE |
| D4 | Events remain on catalog via IEventPublisher; synonym is local sync side-effect |
