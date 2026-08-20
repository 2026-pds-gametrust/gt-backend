#!/usr/bin/env bash
# Ensure open case and retrieve possession proof code for a listing
curl -X GET 'http://localhost:3000/listings/{listingId}/proof-code' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <access_token>'
