#!/usr/bin/env bash
# Open or resume a conversation for a published listing
curl -X POST 'http://localhost:3000/conversations' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <access_token>' \
  -H 'Content-Type: application/json' \
  -d '{
  "listingId": "string"
}'
