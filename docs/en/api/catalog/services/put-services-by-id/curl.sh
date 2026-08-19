#!/usr/bin/env bash
# Update taxonomy service
curl -X PUT 'http://localhost:3000/services/550e8400-e29b-41d4-a716-446655440000' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <access_token>' \
  -H 'Content-Type: application/json' \
  -d '{
  "name": "string",
  "synonyms": [
    "string"
  ],
  "status": "ACTIVE"
}'
