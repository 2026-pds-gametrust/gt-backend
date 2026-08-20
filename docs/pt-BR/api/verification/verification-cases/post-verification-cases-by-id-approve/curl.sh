#!/usr/bin/env bash
# Approve case and grant seal (backoffice)
curl -X POST 'http://localhost:3000/verification-cases/550e8400-e29b-41d4-a716-446655440000/approve' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <access_token>' \
  -H 'Content-Type: application/json' \
  -d '{
  "decisionReason": "string",
  "sealType": "POSSESSION"
}'
