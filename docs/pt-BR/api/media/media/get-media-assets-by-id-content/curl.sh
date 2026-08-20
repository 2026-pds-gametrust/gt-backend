#!/usr/bin/env bash
# Get a short-lived content grant
curl -X GET 'http://localhost:3000/media/assets/550e8400-e29b-41d4-a716-446655440000/content' \
  -H 'Accept: application/json'
