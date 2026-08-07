# EvidenceItem MVP — Requirements

feature: evidence-item-mvp
status: Approved
version: 0.1.0
owner: Product
createdAt: 2026-08-07
updatedAt: 2026-08-07
approvedBy: Plan execution gate (entity loop E11)
approvedAt: 2026-08-07

## Objective

OBJ-01 — Attach restricted evidence metadata to a verification case.

## Scope

- Add evidence (type, storageKey, optional contentHash) to case
- List evidence by caseId
- Restricted classification: raw media never public; API returns metadata only

## Out of scope

- Presigned upload URL generation
- Public evidence DTOs for marketplace

## Acceptance criteria

- AC-01: Add evidence to existing case persists item
- AC-02: Missing case returns 404
- AC-03: storageKey required

## Entity source

docs/entities/evidence-item/
