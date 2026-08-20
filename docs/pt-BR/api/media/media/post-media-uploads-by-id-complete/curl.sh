#!/usr/bin/env bash
# Confirm the object arrived and start processing
curl -X POST 'http://localhost:3000/media/uploads/550e8400-e29b-41d4-a716-446655440000/complete' \
  -H 'Accept: application/json'
