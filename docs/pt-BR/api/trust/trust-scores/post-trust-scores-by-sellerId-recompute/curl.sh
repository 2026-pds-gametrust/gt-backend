#!/usr/bin/env bash
# Recompute trust score from ledger
curl -X POST 'http://localhost:3000/trust-scores/550e8400-e29b-41d4-a716-446655440004/recompute' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <access_token>'
