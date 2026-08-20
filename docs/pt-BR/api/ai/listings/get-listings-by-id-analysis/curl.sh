#!/usr/bin/env bash
# Get latest AI validation analysis for a listing
curl -X GET 'http://localhost:3000/listings/550e8400-e29b-41d4-a716-446655440000/analysis' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <access_token>'
