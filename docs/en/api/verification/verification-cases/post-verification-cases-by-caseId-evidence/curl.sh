#!/usr/bin/env bash
# Add evidence metadata to a case
curl -X POST 'http://localhost:3000/verification-cases/550e8400-e29b-41d4-a716-446655440003/evidence' \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "id": "string",
  "type": "PHOTO",
  "storageKey": "string",
  "assetId": "string",
  "contentHash": "string"
}'
