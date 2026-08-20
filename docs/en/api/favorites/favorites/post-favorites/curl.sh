#!/usr/bin/env bash
# Create a favorite
curl -X POST 'http://localhost:3000/favorites' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <access_token>' \
  -H 'Content-Type: application/json' \
  -d '{
  "id": "string",
  "userId": "string",
  "targetType": "PRODUCT",
  "targetId": "string"
}'
