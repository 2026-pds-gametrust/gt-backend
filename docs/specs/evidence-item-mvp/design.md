# EvidenceItem MVP — Design

feature: evidence-item-mvp
status: Approved
version: 0.1.0

## Citations

- docs/entities/evidence-item/*

## Placement

| Concern | Layer |
|---------|-------|
| IEvidenceItem | domain/verification |
| Case existence | EvidenceItemService |
| Mongo `evidence_items` | infraestructure |
| HTTP | VerificationController nested routes |

## Decisions

| ID | Decision |
|----|----------|
| D1 | Collection `evidence_items` |
| D2 | Store storageKey only; never log restricted fields |
| D3 | PROOF_CODE_HASH stored as hash in storageKey/contentHash |
