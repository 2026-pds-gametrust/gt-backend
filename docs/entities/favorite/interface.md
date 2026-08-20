# Favorite — Interface

## Domain type

`IFavorite`

## Fields

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | string | yes |  |
| userId | string | yes |  |
| targetType | EFavoriteTargetType | yes | PRODUCT | LISTING |
| targetId | string | yes |  |
| createdAt | Date | yes |  |

## Local invariants (Entity)

- unique (userId, targetType, targetId)

## Enums

- `EFavoriteTargetType: PRODUCT, LISTING`
