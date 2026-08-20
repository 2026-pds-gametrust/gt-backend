#!/usr/bin/env bash
# Submit listing for verification
curl -X POST 'http://localhost:3000/listings/550e8400-e29b-41d4-a716-446655440000/submit' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <access_token>'
