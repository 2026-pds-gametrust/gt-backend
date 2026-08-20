#!/usr/bin/env bash
# Open verification case for listing
curl -X POST 'http://localhost:3000/verification-cases' \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "id": "string",
  "listingId": "string",
  "checklist": {}
}'
