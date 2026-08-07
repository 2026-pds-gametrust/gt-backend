# Marketplace benchmarks — knowledge base

status: APPROVED
updatedAt: 2026-08-07

Reference inputs for enriching GamerTrust entity interfaces. **Inspiration only** — GamerTrust remains specialized in used electronics with evidence/trust (not a clone).

## Sources analyzed

| Source | Role for GamerTrust | URL |
|--------|---------------------|-----|
| Pichau | Retail catalog UX: departments, SKU/specs, price display (list/sale/PIX/installments), stock, freight regions, favorites/cart | https://www.pichau.com.br |
| Mercado Livre | C2C marketplace: listing (`item`), condition, pictures, shipping modes, seller location, category attributes, buy-now / offers | https://www.mercadolivre.com.br + [ML developers — publicar produtos](https://developers.mercadolivre.com.br/pt_br/publicacao-de-produtos) / [atributos](https://developers.mercadolivre.com.br/pt_br/atributos) |

## What we adopt from Pichau (buyer / catalog)

| Signal observed | Maps to GamerTrust entity |
|-----------------|---------------------------|
| Department / category tree (ex.: Hardware → Placa de Vídeo) | `category` + hierarchy `parentId` |
| Filters by brand / chipset family (NVIDIA, AMD) | `category-attribute-schema` + product `specs` / brand |
| Card: brand + model + memory + bus + SKU/MPN | `product` (`brand`, `model`, `mpn`, `sku`, `specs`) |
| List price vs promotional price; PIX %; installments | Listing: `priceCents`; optional `listPriceCents`; payment display is checkout (P2) — not domain pricing engine in P1 |
| Stock units / “EM ESTOQUE” | Used marketplace: **quantity = 1** physical unit on `listing` (anti double-sell) |
| Frete grátis por região | `listing.shipping` + CEP from `profile.addresses` at quote time (P2) |
| Favoritos / carrinho | `favorite` (P1); cart multi-item deferred (product rule: 1 item/tx MVP) |
| Garantia / formas de pagamento links | `listing.warranty` (seller); payments module P2 |

## What we adopt from Mercado Livre (seller / listing)

| Signal / API field | Maps to GamerTrust entity |
|--------------------|---------------------------|
| `title`, `category_id`, `seller_id` | `listing.title`, `product.categoryId` / listing→product, `sellerId` |
| `price`, `currency_id` | `priceCents` + `currency` (Money; integer cents) |
| `condition` / `item_condition` attribute | `listing.condition` (used-focused enum) |
| `pictures[]`, descriptions | `listing.media` (photos/video); evidence remains in verification |
| `shipping.mode`, `free_shipping`, `local_pick_up`, `logistic_type` | `listing.shipping` (`PICKUP`, `SHIPPING`, dims/weight) |
| `seller_address` city/state (approx) | Public: `profile.locationApprox`; exact address only in checkout |
| Category `attributes` (BRAND, COLOR, …; tags: required, fixed, variation) | `category-attribute-schema.attributes[]` |
| `sale_terms` / WARRANTY_* | `listing.warrantyType`, `warrantyMonths` |
| `buying_mode` buy_it_now | P1 publish implies buy-now intent; offers/counteroffers → orders P2 |
| `available_quantity` | Always **1** for unique used unit (DEC-041 reservation in P2) |
| Seller reputation | `trust-score` / `seller-level` (not ML metric copy) |

## Explicit non-goals (do not copy blindly)

- Multi-quantity retail inventory (Pichau stock counts) for the same SKU as sellable duplicates — GamerTrust sells **unique used units**.
- Immediate buyer↔seller contact exchange (ML hides contact until purchase) — we keep mediation + protected payment (P2).
- Full ML listing_type / advertising products — ads module is Phase 4.
- Storing password or payment PAN on identity — IdP + payments module.

## Entity docs updated from this analysis

- [product](../product/)
- [category-attribute-schema](../category-attribute-schema/)
- [listing](../listing/)
- [search-document](../search-document/)
- [user](../user/) / [profile](../profile/) (prior ecommerce account/address pass)
