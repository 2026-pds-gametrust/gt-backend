#!/usr/bin/env bash
# List evidence metadata for a case
curl -X GET 'http://localhost:3000/verification-cases/550e8400-e29b-41d4-a716-446655440003/evidence' \
  -H 'Accept: application/json'
