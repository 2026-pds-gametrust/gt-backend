# Profile — Interface

## Domain type

`IProfile`

Seller/buyer-facing profile plus **delivery addresses** used for freight quoting and checkout (Phase 2 orders). Exact street address is Personal (PII); listing/search surfaces use approximate location only until a deal requires precision (product rule).

## Fields

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | string | yes | |
| userId | string | yes | FK user; unique 1:1 |
| displayName | string | no | Public nickname (may differ from legal `fullName`) |
| bio | string | no | |
| locationApprox | string | no | City/UF or region for discovery — not full street |
| addresses | IAddress[] | no | One or more shipping/billing addresses |
| defaultShippingAddressId | string | no | Must reference an item in `addresses` |
| setupItems | object[] | no | Meu Setup equipment refs |
| createdAt | Date | yes | |
| updatedAt | Date | yes | |

### Nested type `IAddress`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | string | yes | Stable within profile |
| label | string | no | e.g. Casa, Trabalho |
| recipientName | string | yes | Identificação do destinatário |
| postalCode | string | yes | CEP (8 digits BR) — required for freight APIs |
| street | string | yes | Logradouro |
| number | string | yes | |
| complement | string | no | |
| district | string | yes | Bairro |
| city | string | yes | |
| state | string | yes | UF (2 letters) |
| country | string | yes | Default `BR` |
| isBilling | boolean | no | Default false |
| isShipping | boolean | no | Default true |

## Local invariants (Entity)

- `userId` required
- Each address: `postalCode` 8 digits; `state` length 2; `recipientName`/`street`/`number`/`district`/`city` non-empty
- `defaultShippingAddressId` if set must match an `addresses[].id`

## Enums

- None (address is a value object / nested entity, not a separate collection in Phase 1)

## Data classification

| Field | Class |
| --- | --- |
| displayName, locationApprox, setupItems | Personal / public-limited |
| addresses.* | Personal (PII) — never in domain events; checkout ports only with ActorContext |

## Design note

Phase 1 keeps addresses embedded on `profiles` (one collection ownership). If volume/complexity grows, a dedicated `addresses` collection under identity can be introduced via an ownership hand-off recorded in ARCH-002 before implementation.
