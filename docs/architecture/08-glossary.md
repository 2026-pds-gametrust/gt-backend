# Glossary EN ↔ PT — GamerTrust Backend

feature: architecture-canon
doc: ARCH-008
status: Approved
version: 0.1.0
owner: Architecture
jira: N/A
createdAt: 2026-08-07
updatedAt: 2026-08-07
approvedBy: Plan execution gate (Ralph Loops Fase 1)
approvedAt: 2026-08-07

## How to use this glossary

- English is **normative** for all code identifiers, specs, and architecture docs (DEC-080, kit rule). The pt-BR column maps back to the product docs in `context/GamerTrust-*.md`.
- New product terms must be added here **before** first use in a spec or code identifier — the glossary is the only sanctioned mapping.
- Source column: `[03]` = `context/GamerTrust-03-SEARCH-AND-DISCOVERY.md`, etc.

## Core marketplace terms

| EN (normative) | PT (product docs) | Definition | Module | Source |
|----------------|-------------------|------------|--------|--------|
| Listing | Anúncio / Oferta (unidade) | One seller's specific used unit for sale — price, condition, defects, accessories, seals | listings | [05] |
| Product (model) | Produto / Modelo | Canonical catalog entry (brand, model, specs, reference images) grouping many listings | catalog | [03] |
| Category | Categoria | Unique canonical product taxonomy node (slug, name, synonyms) | catalog | [03][05] |
| Service (taxonomy) | Serviço | Unique canonical marketplace service taxonomy node (e.g. diagnosis/evaluation); not a domain Service class | catalog | [01][07] |
| Synonym | Sinônimo | Normalized alias resolving to exactly one Category or Service (global uniqueness) | catalog (master) / search (projection) | [03] |
| Offer (bid) | Proposta / Oferta (negociação) | A buyer's price proposal on a listing, with expiry | orders | [05] |
| Counteroffer | Contraproposta | Seller's response proposal in a negotiation | orders | [05] |
| Buy now | Compra imediata | Direct purchase at listed price, no negotiation | orders | [05] |
| Reservation | Reserva | Time-bounded hold of a unique unit for an accepted offer / checkout | listings | [05] |
| Seal | Selo | Verification badge with review date (possession, functioning, identity, protected purchase, warranty); expires/revokes | verification | [04] |
| Evidence | Evidência | Photos/video captured under the proof protocol showing the item, code, and requested tests | verification | [04] |
| Proof code | Código de posse | Platform-generated code the seller must show in evidence media | verification | [04] |
| Verification case | Caso de verificação | The review unit: evidence + checklist + AI triage + human decision | verification | [04] |
| Evidence summary | Resumo de evidências | Published-safe subset: checklist results, approved frames, capture date, limitations | verification | [04] |
| TrustScore | TrustScore / Pontuação de confiança | Explainable seller score derived from real behavior (sales, disputes, reviews) | trust | [04] |
| Seller level | Nível do vendedor | Novo / Em evolução / Confiável / Excelente | trust | [04] |
| Trust summary | Resumo de confiança | AI-generated, cited summary of a listing/seller's verification state | ai | [04][06] |
| Escrow payment | Pagamento protegido | Payment held by the platform, released to the seller on completion | payments | [04] |
| Payout | Repasse | Release of held funds to the seller | payments | [04] |
| Dispute | Contestação | Buyer/seller claim within the protection window (not received, different from listing, …) | disputes | [04] |
| Appeal | Recurso / Revisão | Request to review a dispute or moderation decision | disputes | [04] |
| Review | Avaliação | Post-transaction bidirectional rating tied to a completed order | reviews | [05] |
| Verified purchase | Compra verificada | Badge proving a review comes from a real completed order | reviews | [05] |
| Pickup | Retirada (em mãos) | In-person handover with confirmation codes and approximate-then-exact location | orders | [05] |
| Tracked shipping | Envio acompanhado | Shipping flow with events and deadlines inside the protected flow | orders | [05] |
| Delivery confirmation | Confirmação de entrega | Buyer/seller confirmation step that starts the dispute window | orders | [05] |
| Dispute window | Janela de contestação | Bounded period after delivery in which a dispute can be opened | disputes | [04] |
| Favorite | Favorito | Saved product or specific listing | favorites | [03] |
| Saved search | Pesquisa salva | Persisted query with filters, feeding alerts | favorites | [03] |
| Price alert / Price radar | Alerta de preço / Radar de preço | Notification rule on price drop or new offer for a model | favorites | [05][07] |
| Zero-result recovery | Resultado zero (recuperação) | Useful empty-result screen: alternatives + create alert | search | [03] |
| Recommended offer | Oferta recomendada | Explained highlight among grouped offers of a product | search | [03] |
| Listing quality score | Qualidade do anúncio | Internal completeness/quality signal used in ranking and seller feedback | listings | [05] |
| User | Usuário / Conta | Account actor: fullName, email, phone, CPF, birthDate, verification — no password in domain | identity | [02][05] |
| Profile | Perfil | Display, Meu Setup, locationApprox, shipping addresses | identity | [02][05] |
| Address | Endereço | Nested shipping/billing address (CEP, street, number, district, city, UF, recipient) | identity (on profile) | [05] |
| CPF | CPF | Brazilian tax id on User; PII; unique; never in events/logs | identity | [04][07] |
| SKU / MPN | SKU / MPN | Catalog identifiers on Product (retail-style codes) | catalog | benchmark |
| Listing media | Mídia do anúncio | Seller photos/video of the unit (public); not restricted evidence | listings | [05] |
| Shipping mode | Modalidade de entrega | PICKUP and/or SHIPPING on Listing | listings | [05] |
| My setup | Meu setup | User-registered owned equipment, used for compatibility features | identity | [02][07] |
| Report | Denúncia | User-submitted flag of a listing/user for moderation | moderation | [04] |
| Moderation queue | Fila de revisão | Risk-prioritized queue of cases for human reviewers | moderation | [02][06] |
| Sponsored placement | Conteúdo patrocinado | Paid slot, always labeled, never styled as a trust signal | ads | [03] |
| Price suggestion (band) | Sugestão de preço (faixa) | Explained price range with factors — never a single "correct" price | pricing | [05][06] |
| Capture guide | Guia de captura | Real-time AI guidance during evidence recording | ai | [06] |

## Module names

| Module slug | PT capability |
|-------------|---------------|
| identity | Cadastro, perfil e verificação de identidade |
| catalog | Catálogo de produtos/modelos, categorias e serviços (taxonomia) |
| listings | Anúncios / ofertas |
| verification | Evidências e verificação (selos) |
| trust | Reputação / TrustScore |
| search | Busca e descoberta |
| favorites | Favoritos, pesquisas salvas e alertas |
| orders | Pedidos, negociação e entrega |
| payments | Pagamento protegido (escrow) |
| disputes | Contestações |
| reviews | Avaliações |
| notifications | Notificações |
| ai | Serviços de IA (assistentes, RAG) |
| pricing | Inteligência de preços |
| moderation | Moderação / Trust Ops |
| analytics | Métricas e experimentos |
| ads | Patrocinados |

## Decisions

| ID | Decision | Chosen | Rejected alternatives | Status |
|----|----------|--------|-----------------------|--------|
| DEC-080 | Language policy | English normative for code/specs/docs; this glossary is the only sanctioned EN↔PT mapping; new terms registered here before use | Bilingual specs (drift between versions); ad-hoc per-spec translations (inconsistent identifiers) | Draft |

## Approval

- Gate: APPROVED
- Approver: Plan execution gate (Ralph Loops Fase 1)
- Date: 2026-08-07

## Changelog

| Version | Date | Change |
|---------|------|--------|
| 0.1.1 | 2026-08-07 | Loop 01a: Category, Service (taxonomy), Synonym terms; catalog PT description |
| 0.1.0 | 2026-08-07 | Initial glossary harvested from context/GamerTrust-00..08 and ARCH-001..007 |
