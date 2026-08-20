#!/usr/bin/env bash
# List listing status events
curl -X GET 'http://localhost:3000/listings/550e8400-e29b-41d4-a716-446655440000/events' \
  -H 'Accept: application/json'
