#!/usr/bin/env bash
# Create a presigned image or listing video upload grant
curl -X POST 'http://localhost:3000/media/uploads' \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "id": "string",
  "purpose": "PRODUCT",
  "ownerId": "string",
  "contentType": "image/jpeg",
  "byteSize": 1
}'
