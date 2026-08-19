#!/usr/bin/env bash
# List authenticated seller's own listings
curl -X GET 'http://localhost:3000/listings/mine?status=DRAFT&limit=20&offset=0' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <access_token>'
