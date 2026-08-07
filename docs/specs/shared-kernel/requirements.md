# Shared kernel — requirements

feature: shared-kernel
status: Approved
version: 0.1.0
approvedBy: Ralph Loops Wave 1
approvedAt: 2026-08-07

## Goal
Provide DEC-012 shared types: event envelope, IEventPublisher, Money, ActorContext, pagination, synonym normalization.

## Acceptance
- Domain has no infra imports
- Envelope fields match ARCH-003
- Money uses integer cents + currency
