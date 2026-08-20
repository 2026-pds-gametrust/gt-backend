# TrustScore MVP — Design

feature: trust-score-mvp
status: Approved
version: 0.1.0

## Citations

- docs/entities/trust-score/*

## Placement

| Concern | Layer |
|---------|-------|
| ITrustScore | domain/trust |
| Additive recompute | TrustScoreService |
| Mongo `trust_scores` | infraestructure |

## Decisions

| ID | Decision |
|----|----------|
| D1 | Collection `trust_scores`; unique sellerId |
| D2 | P1 additive weights: USER_VERIFIED=+10, SEAL_GRANTED=+20, SEAL_REVOKED=-20 |
| D3 | components object stores per-type contribution totals |
| D4 | After recompute, derive SellerLevel via thresholds in seller-level-mvp design |
