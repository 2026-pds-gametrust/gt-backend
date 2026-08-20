#!/usr/bin/env bash
# Revoke an active seal (backoffice)
curl -X POST 'http://localhost:3000/seals/550e8400-e29b-41d4-a716-446655440000/revoke' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <access_token>' \
  -H 'Content-Type: application/json' \
  -d '{
  "sellerId": "string"
}'
