# Favorite MVP — Design

feature: favorite-mvp
status: Approved
version: 0.1.0

## Citations

- docs/entities/favorite/*

## Placement

| Concern | Layer |
|---------|-------|
| IFavorite + EFavoriteTargetType | domain/favorites |
| Add/remove/list + uniqueness | FavoriteService |
| Mongo `favorites` | infraestructure |
| POST/DELETE/GET `/favorites` | FavoritesController |

## Decisions

| ID | Decision |
|----|----------|
| D1 | Collection `favorites`; unique compound (userId, targetType, targetId) |
| D2 | Validate user exists; validate product/listing exists by targetType |
| D3 | Events via IEventPublisher optional on create (`favorites.favorite.created`) for future consumers |
