# TrustScore MVP — Requirements

feature: trust-score-mvp
status: Approved
version: 0.1.0
owner: Product
createdAt: 2026-08-07
updatedAt: 2026-08-07
approvedBy: Plan execution gate (entity loop E14)
approvedAt: 2026-08-07

## Objective

OBJ-01 — Recompute explainable seller trust score from trust_events.

## Scope

- Upsert score for sellerId via simple additive algorithm
- Get score (default empty score when missing)
- Publish trust.score.updated
- Update SellerLevel after recompute

## Out of scope

- Weighted ML scoring
- P2 order/dispute/review components

## Acceptance criteria

- AC-01: Recompute from events yields deterministic score
- AC-02: Missing score get returns default score 0
- AC-03: Recompute publishes trust.score.updated

## Entity source

docs/entities/trust-score/
