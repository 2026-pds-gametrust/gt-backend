# Seal MVP — Design

feature: seal-mvp
status: Approved
version: 0.1.0

## Citations

- docs/entities/seal/*

## Placement

| Concern | Layer |
|---------|-------|
| ISeal + enums | domain/verification |
| Grant uniqueness / revoke | SealService |
| Mongo `seals` | infraestructure |

## Decisions

| ID | Decision |
|----|----------|
| D1 | Collection `seals` |
| D2 | Active = status GRANTED; uniqueness enforced in Service |
| D3 | Default type POSSESSION on approve when not specified |
