#!/usr/bin/env bash
# Request granular listing changes (backoffice)
curl -X POST 'http://localhost:3000/verification-cases/550e8400-e29b-41d4-a716-446655440000/request-changes' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <access_token>' \
  -H 'Content-Type: application/json' \
  -d '{
  "summary": "string",
  "requiredChanges": [
    {
      "target": "PHOTO",
      "reason": "string",
      "assetId": "string",
      "checklistItemId": "string"
    }
  ]
}'
