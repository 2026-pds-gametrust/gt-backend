# ListingEvent — Interface

## Domain type

`IListingEvent`

## Fields

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | string | yes |  |
| listingId | string | yes |  |
| fromStatus | EListingStatus | null | no |  |
| toStatus | EListingStatus | yes |  |
| reason | string | no |  |
| actorId | string | no | system or user |
| occurredAt | Date | yes |  |

## Local invariants (Entity)

- append-only

## Enums

- None
