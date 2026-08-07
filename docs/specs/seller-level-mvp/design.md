# SellerLevel MVP — Design

feature: seller-level-mvp
status: Approved
version: 0.1.0

## Citations

- docs/entities/seller-level/*

## Placement

| Concern | Layer |
|---------|-------|
| ISellerLevel + ESellerLevel | domain/trust |
| Threshold derivation | SellerLevelService / TrustScoreService |
| Mongo `seller_levels` | infraestructure |

## Decisions

| ID | Decision |
|----|----------|
| D1 | Collection `seller_levels`; unique sellerId |
| D2 | Thresholds (score inclusive): NEW 0–9, EVOLVING 10–49, TRUSTED 50–99, EXCELLENT ≥100 |
| D3 | Negative scores clamp to NEW |
