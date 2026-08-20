#!/usr/bin/env bash
# Get trust score for seller (default 0)
curl -X GET 'http://localhost:3000/trust-scores/550e8400-e29b-41d4-a716-446655440004' \
  -H 'Accept: application/json'
