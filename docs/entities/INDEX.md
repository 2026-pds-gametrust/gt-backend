# Entity catalog INDEX

status: APPROVED
updatedAt: 2026-08-07
gate: APPROVED

## Phase 1 — full documentation (loop order)

| Order | Slug | Entity | Module | Collection | Kind | Dependencies | Status |
|-------|------|--------|--------|------------|------|--------------|--------|
| 1 | [`category`](category/) | Category | `catalog` | `categories` | aggregate | — | APPROVED |
| 2 | [`service`](service/) | Service | `catalog` | `services` | aggregate | synonym uniqueness with category | APPROVED |
| 3 | [`user`](user/) | User | `identity` | `users` | aggregate | — | APPROVED |
| 4 | [`profile`](profile/) | Profile | `identity` | `profiles` | entity | user | APPROVED |
| 5 | [`category-attribute-schema`](category-attribute-schema/) | CategoryAttributeSchema | `catalog` | `category_attribute_schemas` | entity | category | APPROVED |
| 6 | [`product`](product/) | Product | `catalog` | `products` | aggregate | category | APPROVED |
| 7 | [`price-history`](price-history/) | PriceHistory | `catalog` | `price_history` | entity | product (P1–2; hand-off pricing P3 DEC-023) | APPROVED |
| 8 | [`listing`](listing/) | Listing | `listings` | `listings` | aggregate | user, product | APPROVED |
| 9 | [`listing-event`](listing-event/) | ListingEvent | `listings` | `listing_events` | ledger | listing | APPROVED |
| 10 | [`verification-case`](verification-case/) | VerificationCase | `verification` | `verification_cases` | aggregate | listing | APPROVED |
| 11 | [`evidence-item`](evidence-item/) | EvidenceItem | `verification` | `evidence_items` | entity | verification-case | APPROVED |
| 12 | [`seal`](seal/) | Seal | `verification` | `seals` | entity | verification-case / listing | APPROVED |
| 13 | [`trust-event`](trust-event/) | TrustEvent | `trust` | `trust_events` | ledger | identity / seals | APPROVED |
| 14 | [`trust-score`](trust-score/) | TrustScore | `trust` | `trust_scores` | aggregate | trust-event | APPROVED |
| 15 | [`seller-level`](seller-level/) | SellerLevel | `trust` | `seller_levels` | entity | trust-score | APPROVED |
| 16 | [`search-document`](search-document/) | SearchDocument | `search` | `search_documents` | read-model | listing, product, trust | APPROVED |
| 17 | [`synonym`](synonym/) | Synonym | `search` | `synonyms` | projection | category/service events | APPROVED |
| 18 | [`query-log`](query-log/) | QueryLog | `search` | `query_logs` | entity | — | APPROVED |
| 19 | [`favorite`](favorite/) | Favorite | `favorites` | `favorites` | aggregate | user + product\|listing | APPROVED |

## Phase 2–4 — stubs only

| Order | Slug | Entity | Module | Collection | Kind | Dependencies | Status |
|-------|------|--------|--------|------------|------|--------------|--------|
| — | `order` | — | `orders` | — | stub | Phase 2 | STUB |
| — | `negotiation` | — | `orders` | — | stub | Phase 2 | STUB |
| — | `delivery-code` | — | `orders` | — | stub | Phase 2 | STUB |
| — | `payment` | — | `payments` | — | stub | Phase 2 | STUB |
| — | `escrow-hold` | — | `payments` | — | stub | Phase 2 | STUB |
| — | `refund` | — | `payments` | — | stub | Phase 2 | STUB |
| — | `dispute` | — | `disputes` | — | stub | Phase 2 | STUB |
| — | `review` | — | `reviews` | — | stub | Phase 2 | STUB |
| — | `notification` | — | `notifications` | — | stub | Phase 2 | STUB |
| — | `rag-document` | — | `ai` | — | stub | Phase 3 | STUB |
| — | `price-suggestion` | — | `pricing` | — | stub | Phase 3 | STUB |
| — | `moderation-case` | — | `moderation` | — | stub | Phase 3 | STUB |
| — | `campaign` | — | `ads` | — | stub | Phase 4 | STUB |

## Implementation start

**First Ralph Loop after catalog APPROVED:** [`category`](category/) (order 1), then `service`, then `user`.

## Approval

- Gate: APPROVED
- Approver: Plan execution gate (Docs entidades Fase 1)
- Date: 2026-08-07
